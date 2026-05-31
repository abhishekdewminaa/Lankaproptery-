import { GoogleGenAI, Type } from '@google/genai';

export async function generateWorkflowFromPrompt(prompt: string) {
  // Try calling the server side endpoint to proxy gemini 
  try {
    const res = await fetch('/api/gemini/generate-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Gemini error:', e);
    
    // Polyfill structured JSON for the prompt if backend gives error
    return {
      workflow_name: "Auto-generated Workflow",
      description: "Workflow generated from prompt: " + prompt,
      nodes: [
        {
          id: "node_start_" + Date.now(),
          type: "trigger",
          subtype: "new_property",
          label: "New Property Published",
          position: { x: 100, y: 150 },
          config: {},
          icon: "🏠",
          color: "#1565C0"
        },
        {
          id: "node_action_" + Date.now(),
          type: "action",
          subtype: "post_facebook",
          label: "Post to Facebook",
          position: { x: 400, y: 150 },
          config: {},
          icon: "📘",
          color: "#0284c7"
        }
      ],
      edges: [
        {
          id: "edge_1_" + Date.now(),
          source: "node_start_" + Date.now(),
          target: "node_action_" + Date.now(),
          animated: true,
          label: "then"
        }
      ],
      suggestions: [
        "Consider adding an If/Else to check if property price is above Rs.10M"
      ],
      warnings: ["This is a local fallback dummy workflow since API failed"]
    };
  }
}
