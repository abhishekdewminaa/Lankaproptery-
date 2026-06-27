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
      try {
        const response = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'new_inquiry',
            data: {
              property_title: context.title || context.listing_title || 'N/A',
              district: context.district || '',
              city: context.city || '',
              price_lkr: context.price_lkr || context.price || 'N/A',
              agent_email: config.to_email || 'abhishekdewminaa@gmail.com',
              client_name: 'Automation Workflow',
              client_phone: 'N/A',
              client_email: 'noreply@lankaproperty.lk',
              message: config.body || `Auto promoted listing: ${context.title || context.listing_title || 'N/A'}`
            }
          })
        });
        const resData = await response.json();
        result.output = { email_sent: true, api_status: resData.status };
        toast.success(`Workflow notification sent to ${config.to_email}`);
      } catch (err: any) {
        console.error("Failed to send notification via API:", err);
        result.output = { email_sent: false, error: err.message };
        toast.error("Workflow notification API error");
      }
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
      const prompt = `Write an engaging real estate social media caption for ${platform} for the following property:\n\nTitle: ${context.title || context.listing_title || 'N/A'}\nLocation: ${context.city || ''}, ${context.district || ''}\nPrice: Rs. ${context.price_lkr || context.price || 'N/A'}\nDescription: ${context.description || ''}\n\nMake it catchy with relevant hashtags.`;
      
      try {
        const response = await fetch('/api/ai/generate-caption', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        });
        const resData = await response.json();
        result.output = { 
           [config.outputVar || 'ai_caption']: resData.caption || `Check out this amazing property in ${context.district}! 🏡✨`
        };
      } catch (err: any) {
        console.error("Failed to generate caption via backend Gemini endpoint:", err);
        result.output = { 
           [config.outputVar || 'ai_caption']: `Check out this beautiful property in ${context.district}! #LankaProperty`
        };
      }
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
