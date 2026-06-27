import { supabase } from '../supabaseClient';
import { executeNode } from './nodeExecutors';
import { Workflow, AutomationsNode } from './types';

export async function runWorkflow(workflow: Workflow, triggerData: any = {}) {
  const logId = `log_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const startTime = Date.now();
  let status = 'success';
  let finalContext = { ...triggerData };

  try {
    // Create log entry running status
    await supabase.from('workflow_logs').insert([{
      id: logId,
      workflow_id: workflow.id,
      triggered_by: workflow.trigger_type || 'Manual',
      status: 'running',
      ran_at: new Date().toISOString()
    }]);

    const triggerNode = workflow.nodes.find(n => n.data.category === 'trigger');
    if (!triggerNode) throw new Error('No trigger node found');

    let totalExecutions = 0;
    const maxExecutions = 50;

    async function executeBranch(node: AutomationsNode, context: any): Promise<any> {
      if (totalExecutions >= maxExecutions) {
        return context;
      }
      totalExecutions++;

      // execute current node
      const result = await executeNode(node, context);
      
      // merge output into context
      const newContext = { ...context, ...result.output };

      // find next edges
      const outgoing = workflow.edges.filter(e => e.source === node.id);

      if (outgoing.length === 0) {
        return newContext;
      }

      if (node.data.category === 'condition') {
        const outcomeHandle = result.branchOutcome ? 'true' : 'false';
        const matchEdge = outgoing.find(e => e.sourceHandle === outcomeHandle);
        if (matchEdge) {
          const nextNode = workflow.nodes.find(n => n.id === matchEdge.target);
          if (nextNode) {
            return executeBranch(nextNode, newContext);
          }
        }
        return newContext;
      }

      // If multiple outgoing edges (or 1), traverse concurrently using Promise.all
      const branchPromises = outgoing.map(async (edge) => {
        const nextNode = workflow.nodes.find(n => n.id === edge.target);
        if (nextNode) {
          return executeBranch(nextNode, newContext);
        }
        return newContext;
      });

      const contexts = await Promise.all(branchPromises);
      
      // Merge all outputs together
      return contexts.reduce((acc, ctx) => ({ ...acc, ...ctx }), newContext);
    }

    finalContext = await executeBranch(triggerNode, finalContext);

  } catch (err) {
    console.error('Workflow execution failed:', err);
    status = 'failed';
  } finally {
    // Update log
    const duration = Date.now() - startTime;
    await supabase.from('workflow_logs').update({
       status,
       duration_ms: duration,
       completed_at: new Date().toISOString()
    }).eq('id', logId);

    if (workflow.id) {
       await supabase.from('workflows').update({
          last_run_at: new Date().toISOString() 
          // Note: we can't safely increment run_count in update w/o RPC, but good enough for mockup.
       }).eq('id', workflow.id);
    }
    
    return { status, context: finalContext };
  }
}
