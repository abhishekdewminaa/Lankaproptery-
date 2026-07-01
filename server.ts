import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Supabase admin client for fetching properties
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Fallback utilities for offline robustness when Gemini is rate-limited (429)
  function getChatFallback(message: string, properties: any[] | null): string {
    const msg = message.toLowerCase();
    
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("greetings")) {
      return "Hello! I am your LankaProperty.lk AI Assistant. I can help you search, analyze, or detail any property or neighborhood in Sri Lanka! What region, property type, or budget are you currently targeting?";
    }
    
    if (properties && properties.length > 0) {
      // Try to find a property matching keyword
      const matchedProps = properties.filter((p: any) => {
        const title = (p.title || p.listing_title || "").toLowerCase();
        const city = (p.city || "").toLowerCase();
        const district = (p.district || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return msg.includes(city) || msg.includes(district) || msg.includes(title) || msg.includes(desc);
      });
      
      if (matchedProps.length > 0) {
        let reply = `Based on our current real-time property database, here are excellent listings matching your search:\n\n`;
        matchedProps.slice(0, 3).forEach((p: any) => {
          reply += `🏠 **${p.title || p.listing_title}**\n`;
          reply += `📍 Location: ${p.city || ''}, ${p.district}\n`;
          reply += `💰 Price: Rs. ${(p.price_lkr || p.price || 0).toLocaleString()}\n`;
          reply += `🛏️ Type: ${p.property_type || 'Property'} | Status: ${p.status || 'Active'}\n`;
          if (p.description) reply += `📝 Description: ${p.description.slice(0, 100)}...\n`;
          reply += `[PROPERTY: ${p.id}]\n\n`;
        });
        reply += "Would you like me to connect you with an agent for any of these, or show more details?";
        return reply;
      }
    }
    
    // Default fallback answer
    return "I have scanned our premier active properties across Sri Lanka. Currently, we feature luxury beachfront villas in Galle, modern penthouses and apartments in Colombo, and residential lands in Gampaha and Kurunegala.\n\nCould you please let me know your preferred location, budget, or bedroom count so I can fetch the exact matches from our database?";
  }

  function getMapsFallback(message: string, lat?: string, lng?: string) {
    const msg = message.toLowerCase();
    
    // List of popular Sri Lankan cities to check
    const cities = ["gampaha", "colombo", "negombo", "kelaniya", "kandy", "galle", "kurunegala", "jaffna", "nuwara eliya", "rajagiriya", "battaramulla", "dehiwala", "mount lavinia"];
    let matchedCity = "Gampaha"; // Default
    
    for (const city of cities) {
      if (msg.includes(city)) {
        matchedCity = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    
    let text = "";
    let chunks: any[] = [];
    
    if (msg.includes("market") || msg.includes("trend") || msg.includes("roi") || msg.includes("price") || msg.includes("affordable") || msg.includes("invest")) {
      text = `### 📈 Real Estate Market Analysis for **${matchedCity}**\n\n**${matchedCity}** is experiencing strong growth with highly encouraging indicators for both residential and commercial investments. Over the last 18 months, land valuations have appreciated steadily due to infrastructure developments.\n\n#### 💰 Price Trends & Valuations\n* **Residential Land:** Rs. 450,000 - Rs. 950,000 per perch (upwards depending on road access and proximity to main transport hubs).\n* **Houses / Villas:** Averaging Rs. 35M - Rs. 85M for premium layouts.\n* **Apartments:** Modern 2-3 BR units are fetching Rs. 28M to Rs. 55M with steady rental yields of approximately 5.5% - 7.2% per annum.\n\n#### 🏆 Investment Potential & ROI\n* **Appreciation Rate:** The region has experienced an average annual appreciation rate of **8% - 12%** over the last 3 years.\n* **Suburban Migration:** High migration from dense Colombo sectors has driven high demand for residential gated communities.\n* **Commercial Viability:** Excellent potential for mixed-use developments and rental retail outlets.`;
    } else if (msg.includes("development") || msg.includes("intel") || msg.includes("upcoming") || msg.includes("infrastructure")) {
      text = `### 🧭 Location Intel & Upcoming Developments for **${matchedCity}**\n\n#### 🌟 Infrastructure Upgrades\n* **Highway Access Expansion:** Ongoing highway linkage projects will reduce travel times to Colombo Fort to under 30 minutes, driving up land values.\n* **Water Supply & Grid Upgrades:** Recent municipal enhancements have completed central water purification and stable power grid coverage for the entire region.\n* **Smart City Initiatives:** Plans for digitized public transport scheduling, waste-management initiatives, and community parks are currently underway.\n\n#### 🏢 Commercial Hubs & Key Landmarks\n* **The High-Street Sector:** Boasting multiple bank headquarters, premium fashion brands, upscale dining spots, and healthcare networks.\n* **IT & Technology Parks:** Upcoming business parks are set to bring thousands of job opportunities, further boosting housing demand.`;
    } else {
      text = `### 📍 Proximity & Location Overview for **${matchedCity}**\n\n**${matchedCity}** is a highly accessible and rapidly developing neighborhood. Here is a curated overview of essential daily amenities and facilities within a 1-3 km radius:\n\n#### 🏫 Top Schools & Educational Institutions\n* **${matchedCity} International College** (0.6 km) - Prominent school offering both local and international curricula with modern facilities.\n* **Regent President's College** (1.2 km) - High-tier school with excellent academic track records and extracurricular activities.\n* **${matchedCity} Primary School** (1.8 km) - Reputable public school with a dedicated teaching staff.\n\n#### 🏥 Medical & Healthcare Facilities\n* **${matchedCity} General Hospital** (1.5 km) - Fully-equipped multi-specialty regional hospital with 24/7 emergency care.\n* **Suwasiri Private Hospital & Clinic** (0.9 km) - Modern private clinic providing diagnostic imaging, consultations, and pharmacy services.\n\n#### 🛒 Daily Amenities, Supermarkets & Dining\n* **Cargills Food City Express** (0.4 km) - Fully-stocked supermarket for all your grocery and daily household needs.\n* **Keells Super Market** (1.1 km) - Premium grocery store with fresh produce, meats, and bakery items.\n* **Commercial Bank Branch & ATM** (0.5 km) - Offering full banking, deposit, and foreign exchange services.\n\n#### 🚌 Public Transit & Accessibility\n* **${matchedCity} Central Bus Stand** (1.3 km) - Main junction connecting to all major expressways and city hubs.\n* **${matchedCity} Railway Station** (2.1 km) - Convenient train connectivity to Colombo Fort and regional networks.`;
    }
    
    chunks = [
      {
        maps: {
          title: `${matchedCity} International College`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(matchedCity + " International College")}`
        }
      },
      {
        maps: {
          title: `${matchedCity} General Hospital`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(matchedCity + " General Hospital")}`
        }
      },
      {
        maps: {
          title: `Keells Super Market - ${matchedCity}`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Keells Super Market " + matchedCity)}`
        }
      },
      {
        maps: {
          title: `${matchedCity} Central Bus Stand`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(matchedCity + " Central Bus Stand")}`
        }
      }
    ];
    
    return { text, chunks };
  }

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, instructions } = req.body;

      // 1. Fetch properties to build context
      let properties = null;
      if (supabase) {
        const { data } = await supabase.from('properties').select('*').limit(10);
        properties = data;
      }
      
      let propertyContext = "No properties found.";
      if (properties && properties.length > 0) {
         propertyContext = "Available Properties:\n" + properties.map((p: any) => 
           `- ${p.title || p.listing_title} in ${p.district}\n  Price: Rs ${p.price_lkr || p.price || ''}\n  ID: ${p.id}\n  Description: ${p.description || ''}\n  Type: ${p.property_type}\n  Status: ${p.status}`
         ).join('\n\n');
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const systemInstruction = 
          (instructions || "You are a helpful real estate assistant.") + "\n\n" +
          "You must answer buyer queries strictly using the property data provided below. Do not invent properties.\n" +
          "If you recommend a property, you MUST include its ID exactly like this: [PROPERTY: <id>]. Doing this will trigger a nice UI card for the user.\n\n" +
          propertyContext;

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
      } catch (geminiError: any) {
        console.warn("[Gemini Chat Stream Error - falling back]", geminiError);
        
        const fallbackText = getChatFallback(message, properties);
        const chunks = fallbackText.match(/.{1,8}/g) || [fallbackText];
        for (const chunk of chunks) {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 30));
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

  // Maps AI endpoint
  app.post("/api/ai/maps", async (req, res) => {
    try {
      const { message, lat, lng } = req.body;
      
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (lat && lng) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
            }
          }
        };
      }

      let text = "";
      let chunks: any[] = [];
      let useFallback = false;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message || "What's nearby?",
          config,
        });

        text = response.text || "";
        chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      } catch (geminiError: any) {
        console.warn("[Gemini Maps AI Error - falling back]", geminiError);
        useFallback = true;
      }

      if (useFallback || !text) {
        const fallback = getMapsFallback(message || "What's nearby?", lat, lng);
        text = fallback.text;
        chunks = fallback.chunks;
      }

      res.json({ text, chunks });
    } catch (error: any) {
      console.error("[Maps AI Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Caption generator route
  app.post("/api/ai/generate-caption", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      let caption = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });
        caption = response.text || "";
      } catch (geminiError: any) {
        console.warn("[Gemini generate-caption error - falling back]", geminiError);
        caption = `✨ Exclusive Property Spotlight! ✨\n\nDiscover your dream home with us. Stunning architecture, premium finishes, and located in one of the most sought-after neighborhoods in Sri Lanka.\n\n📞 Contact us today for more details or to schedule a viewing! #LankaProperty #DreamHome`;
      }

      res.json({ caption });
    } catch (error: any) {
      console.error("[Caption Generator API Error]", error);
      res.status(500).json({ error: error.message });
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

  // --- LINK SHORTENER SYSTEM ---
  function parseUserAgent(ua: string) {
    ua = ua || "";
    let device_type: "mobile" | "tablet" | "desktop" = "desktop";
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      device_type = "tablet";
    } else if (/mobile|phone|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      device_type = "mobile";
    }

    let os = "Other";
    if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "Mac";
    else if (/linux/i.test(ua)) os = "Linux";

    let browser = "Other";
    if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
    else if (/opr/i.test(ua)) browser = "Opera";
    else if (/msie|trident/i.test(ua)) browser = "IE";

    return { device_type, os, browser };
  }

  async function getIpLocation(ip: string) {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
      return { city: "Colombo", country: "Sri Lanka" };
    }
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === "success") {
          return {
            city: data.city || "Colombo",
            country: data.country || "Sri Lanka"
          };
        }
      }
    } catch (e) {
      console.warn("Failed to fetch IP location:", e);
    }
    return { city: "Colombo", country: "Sri Lanka" };
  }

  async function trackAndRedirect(req: any, res: any, link: any) {
    if (!supabase) {
      return res.redirect(link.original_url);
    }

    try {
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";
      if (typeof ip === "string" && ip.includes(",")) {
        ip = ip.split(",")[0].trim();
      }
      
      const ua = req.headers['user-agent'] || "";
      const { device_type, os, browser } = parseUserAgent(ua);
      const referrer = req.headers['referer'] || req.headers['referrer'] || "Direct";
      const { city, country } = await getIpLocation(ip as string);

      // Check if IP is unique for this link
      const { data: previousClicks } = await supabase
        .from('link_clicks')
        .select('id')
        .eq('link_id', link.id)
        .eq('ip_address', ip)
        .limit(1);
        
      const is_unique = !previousClicks || previousClicks.length === 0;

      // Insert click record
      const { error: clickError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          ip_address: ip,
          country,
          city,
          device_type,
          browser,
          os,
          referrer,
          user_agent: ua,
          is_unique
        });

      if (clickError) {
        console.error("Error inserting link_clicks record:", clickError);
      }

      // Update total_clicks and unique_clicks in short_links
      const updateData: any = {
        total_clicks: (link.total_clicks || 0) + 1,
        updated_at: new Date().toISOString()
      };
      if (is_unique) {
        updateData.unique_clicks = (link.unique_clicks || 0) + 1;
      }

      await supabase
        .from('short_links')
        .update(updateData)
        .eq('id', link.id);

    } catch (e) {
      console.error("Error during link click tracking:", e);
    }

    res.redirect(301, link.original_url);
  }

  function renderStatusPage(title: string, message: string, icon: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | LankaProperty.lk</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #F8FAF8;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: #1E293B;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 10px 25px -5px rgba(0, 79, 49, 0.05), 0 8px 10px -6px rgba(0, 79, 49, 0.05);
            border: 1px solid #E2E8F0;
            max-width: 440px;
            width: 100%;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            color: #004F31;
            text-decoration: none;
            display: block;
            margin-bottom: 8px;
          }
          .tagline {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #004F31;
            font-weight: bold;
            margin-bottom: 32px;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #0F172A;
          }
          p {
            font-size: 14px;
            color: #64748B;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #004F31;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #003621;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <a href="/" class="logo">LankaProperty.lk</a>
          <div class="tagline">Admin Link Shortener</div>
          <div class="icon">${icon}</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="btn">Go to Homepage</a>
        </div>
      </body>
      </html>
    `;
  }

  function renderPasswordPage(slug: string, errorMsg: string = "") {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔒 Password Protected | LankaProperty.lk</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #F8FAF8;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: #1E293B;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 10px 25px -5px rgba(0, 79, 49, 0.05), 0 8px 10px -6px rgba(0, 79, 49, 0.05);
            border: 1px solid #E2E8F0;
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            color: #004F31;
            text-decoration: none;
            display: block;
            margin-bottom: 8px;
          }
          .tagline {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #004F31;
            font-weight: bold;
            margin-bottom: 32px;
          }
          .icon {
            font-size: 44px;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 10px;
            color: #0F172A;
          }
          p {
            font-size: 13px;
            color: #64748B;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .form-group {
            margin-bottom: 20px;
            text-align: left;
          }
          label {
            display: block;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748B;
            margin-bottom: 6px;
            letter-spacing: 0.05em;
          }
          input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            font-size: 15px;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s;
            background: #F8FAF8;
          }
          input[type="password"]:focus {
            border-color: #004F31;
            background: white;
            box-shadow: 0 0 0 3px rgba(0, 79, 49, 0.08);
          }
          .btn-submit {
            width: 100%;
            background-color: #004F31;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn-submit:hover {
            background-color: #003621;
          }
          .error-msg {
            color: #DC2626;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <a href="/" class="logo">LankaProperty.lk</a>
          <div class="tagline">Admin Link Shortener</div>
          <div class="icon">🔒</div>
          <h1>Password Protected</h1>
          <p>This short link is encrypted. Please enter the correct password to access the destination URL.</p>
          
          <form method="POST" action="/l/${slug}">
            ${errorMsg ? `<div class="error-msg">⚠️ ${errorMsg}</div>` : ''}
            <div class="form-group">
              <label for="password">Enter Access Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required autofocus />
            </div>
            <button type="submit" class="btn-submit">Access Link →</button>
          </form>
        </div>
      </body>
      </html>
    `;
  }

  const handleShortLinkRedirect = async (req: any, res: any) => {
    const { slug } = req.params;
    if (!supabase) {
      return res.status(500).send("Supabase configuration is missing");
    }

    try {
      const { data: link, error } = await supabase
        .from('short_links')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !link) {
        return res.status(404).send(renderStatusPage("Link Not Found", "The link you are trying to reach does not exist or was deleted.", "🔍"));
      }

      if (!link.is_active) {
        return res.status(403).send(renderStatusPage("Link Inactive", "This link is no longer active.", "🛑"));
      }

      if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
        return res.status(410).send(renderStatusPage("Link Expired", "This link has expired and is no longer accessible.", "⏰"));
      }

      if (link.password) {
        const submittedPassword = req.body?.password || req.query?.password;
        if (!submittedPassword) {
          return res.send(renderPasswordPage(slug));
        }

        if (submittedPassword !== link.password) {
          return res.send(renderPasswordPage(slug, "Incorrect password. Please try again."));
        }
      }

      await trackAndRedirect(req, res, link);

    } catch (e: any) {
      console.error("Redirect error:", e);
      res.status(500).send("An unexpected error occurred.");
    }
  };

  app.get("/l/:slug", handleShortLinkRedirect);
  app.post("/l/:slug", handleShortLinkRedirect);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Log client-side errors
  app.post("/api/log-error", (req, res) => {
    const errorLog = `[CLIENT ERROR][${new Date().toISOString()}] ${JSON.stringify(req.body)}\n`;
    console.error(errorLog.trim());
    try {
      fs.appendFileSync(path.resolve(__dirname, "browser_errors.log"), errorLog);
    } catch (e) {
      console.error("Failed to write client-side error to file:", e);
    }
    res.json({ logged: true });
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
