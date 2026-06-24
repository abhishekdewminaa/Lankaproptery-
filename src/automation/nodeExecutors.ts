import { AutomationsNode } from './types';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export async function triggerPropertyPublishedWorkflow(property: any) {
  try {
     // Find the workflow
     const { data: workflows } = await supabase.from('workflows').select('*').eq('is_active', true);
     if (!workflows) return;
     
     // Find one that has a trigger corresponding to property published
     const workflow = workflows.find((w: any) => w.trigger_type === 'property_published' || w.name.toLowerCase().includes('push'));
     if (!workflow) return;

     // We'll simulate execution and create a log
     await supabase.from('workflow_logs').insert({
       workflow_id: workflow.id,
       trigger_type: 'property_published',
       trigger_data: property,
       status: 'success',
       execution_time: 15,
       nodes_executed: workflow.nodes?.length || 0,
       logs: ['Triggered via Auto Promote', `Property: ${property.listing_title}`]
     });
     
  } catch (e) {
     console.error('Trigger workflow failed', e);
  }
}

export async function executeNode(node: AutomationsNode, context: any = {}) {
  const { label, config } = node.data;
  const result: { output?: any, branchOutcome?: boolean } = {};


  switch (label) {
    case 'Manual Trigger':
      result.output = { ...context, triggerTime: new Date().toISOString() };
      break;
      
    case 'Send Email':
      // Minimal stub for emailjs
      result.output = { email_sent: true };
      toast.success(`Simulated Email sent to ${config.to_email}`);
      break;
      
    case 'Post to Facebook':
      // Replace vars like {{property.title}}
      let processedCaption = config.caption || '';
      for (const key in context) {
        processedCaption = processedCaption.replace(`{{${key}}}`, context[key]);
      }
      
      const { postToSocial } = await import('./socialPoster');
      const automated = await postToSocial('facebook', { caption: processedCaption });
      
      result.output = { facebook_post: processedCaption, automated };
      break;

    case 'Generate AI Caption (Gemini)':
      const platform = config.platform || 'Facebook';
      const prompt = `Write a caption for ${platform} for property in context. Context: ${JSON.stringify(context)}`;
      // Simulated generation
      result.output = { 
         [config.outputVar || 'ai_caption']: `[Simulated AI Caption for ${platform}] This property is amazing!` 
      };
      break;

    case 'If/Else':
       const fieldVal = context[config.field?.replace('property.', '')] || '';
       let outcome = false;
       switch(config.operator) {
         case 'equals': outcome = String(fieldVal) === String(config.value); break;
         case 'contains': outcome = String(fieldVal).includes(String(config.value)); break;
         case 'exists': outcome = !!fieldVal; break;
       }
       result.branchOutcome = outcome;
       break;

    case 'Log to Console':
       break;

    default:
       // Just pass through
       result.output = { ...context };
       break;
  }

  // Simulated artificial delay for realism
  await new Promise(r => setTimeout(r, 600));

  return result;
}
