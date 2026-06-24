import { supabase } from '../supabaseClient';
import { executeNode } from './nodeExecutors';
import { Workflow, AutomationsNode } from './types';

export async function runWorkflow(workflow: Workflow, triggerData: any = {}) {
  const logId = `log_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const startTime = Date.now();
  let status = 'success';
  let context = { ...triggerData };

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

    let currentNode: AutomationsNode | undefined = triggerNode;
    let nextNodeId: string | null = null;
    let limit = 0;

    // Basic graph traversal engine
    while (currentNode && limit < 50) {
       limit++;
       
       // execute current node
       const result = await executeNode(currentNode, context);
       
       // merge output into context
       context = { ...context, ...result.output };

       // find next edges
       const outgoing = workflow.edges.filter(e => e.source === currentNode!.id);
       
       if (outgoing.length === 0) {
          currentNode = undefined; // End of branch
       } else if (outgoing.length === 1 && currentNode.data.category !== 'condition') {
          const nextNode = workflow.nodes.find(n => n.id === outgoing[0].target);
          currentNode = nextNode;
       } else if (currentNode.data.category === 'condition') {
          // If condition, evaluate returning branch handle
          const outcomeHandle = result.branchOutcome ? 'true' : 'false';
          const matchEdge = outgoing.find(e => e.sourceHandle === outcomeHandle);
          if (matchEdge) {
             currentNode = workflow.nodes.find(n => n.id === matchEdge.target);
          } else {
             currentNode = undefined;
          }
       } else {
          // Unhandled split (parallel not fully supported in this minimal engine)
          break;
       }
    }
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
    
    return { status, context };
  }
}
