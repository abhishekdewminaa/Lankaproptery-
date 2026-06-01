import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase admin client for fetching properties
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, instructions } = req.body;

      // 1. Fetch properties to build context
      const { data: properties } = await supabase.from('properties').select('*').limit(10);
      let propertyContext = "No properties found.";
      if (properties && properties.length > 0) {
         propertyContext = "Available Properties:\n" + properties.map((p: any) => 
           `- ${p.title} in ${p.district}\n  Price: Rs ${p.price_lkr}\n  ID: ${p.id}\n  Description: ${p.description || ''}\n  Type: ${p.property_type}\n  Status: ${p.status}`
         ).join('\n\n');
      }

      const systemInstruction = 
        (instructions || "You are a helpful real estate assistant.") + "\n\n" +
        "You must answer buyer queries strictly using the property data provided below. Do not invent properties.\n" +
        "If you recommend a property, you MUST include its ID exactly like this: [PROPERTY: <id>]. Doing this will trigger a nice UI card for the user.\n\n" +
        propertyContext;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
        },
      });

      const responseStream = await chat.sendMessageStream({ message });
      
      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("[AI Chat Error]", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // Local handler for send-notification proxy
  app.post("/api/send-notification", async (req, res) => {
    try {
      const { type, data } = req.body;
      console.log(`[Notification Service] Type: ${type}`, data);

      if (type === 'new_inquiry') {
        const body = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #004F31; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">LankaProperty.lk</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #004F31;">🏠 New Property Inquiry!</h2>
              <p>You have received a new inquiry for your property:</p>
              <div style="background: white; border-left: 4px solid #004F31; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p><b>Property:</b> ${data.property_title || 'N/A'}</p>
                <p><b>Location:</b> ${data.district || ''}, ${data.city || ''}</p>
                <p><b>Price:</b> Rs. ${data.price_lkr || 'N/A'}</p>
              </div>
              <div style="background: white; border-left: 4px solid #007E50; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <h3 style="color: #004F31; margin-top: 0;">👤 Buyer Details:</h3>
                <p><b>Name:</b> ${data.client_name || 'N/A'}</p>
                <p><b>Phone:</b> ${data.client_phone || 'N/A'}</p>
                <p><b>Email:</b> ${data.client_email || 'N/A'}</p>
                <p><b>Message:</b> ${data.message || 'N/A'}</p>
              </div>
              <a href="https://lankaproperty.lk/admin-lk2026" style="background: #004F31; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
                View in Dashboard →
              </a>
            </div>
            <div style="background: #004F31; padding: 16px; text-align: center; color: #A7F3D0; font-size: 12px;">
              © 2026 LankaProperty.lk
            </div>
          </div>
        `;

        if (process.env.RESEND_API_KEY && data.agent_email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'LankaProperty.lk <noreply@lankaproperty.lk>',
              to: [data.agent_email],
              subject: `🏠 New Inquiry: ${data.property_title || 'Property Inquiry'}`,
              html: body
            })
          });
          console.log(`[Notification Service] Email sent successfully via Resend to ${data.agent_email}`);
        } else {
          console.log(`[Notification Service API Fallback] No RESEND_API_KEY configured. Email structure simulation:\nTo: ${data.agent_email || 'N/A'}\nSubject: New Inquiry: ${data.property_title}\nMessage: ${data.message}`);
        }

        // WhatsApp trigger
        if (data.agent_phone && data.agent_whatsapp_key) {
          const phone = data.agent_phone.replace(/[^0-9]/g, '');
          const apiKey = data.agent_whatsapp_key;
          const message = 
            `🏠 *New Property Inquiry!*\n\n` +
            `*Property:* ${data.property_title || 'Property'}\n` +
            `*Location:* ${data.district || 'Sri Lanka'}\n\n` +
            `👤 *Buyer Details:*\n` +
            `Name: ${data.client_name || 'N/A'}\n` +
            `Phone: ${data.client_phone || 'N/A'}\n` +
            `Email: ${data.client_email || 'N/A'}\n\n` +
            `💬 *Message:*\n${data.message || 'N/A'}\n\n` +
            `View dashboard: https://lankaproperty.lk/admin-lk2026`;

          await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
          );
          console.log(`[Notification Service] WhatsApp triggered via CallMeBot for ${phone}`);
        }
      } else if (type === 'new_agent') {
        console.log(`[Notification Service] New Agent Register Simulated alert for ${data.name} (${data.email})`);
      } else if (type === 'new_property') {
        console.log(`[Notification Service] New Property Published Simulated alert for ${data.title}`);
      } else if (type === 'inquiry_status_change') {
        console.log(`[Notification Service] Inquiry status changed to ${data.new_status} for client ${data.client_name}`);
      }

      res.json({ status: "OK" });
    } catch (error: any) {
      console.error("[Notification Service] Error", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
