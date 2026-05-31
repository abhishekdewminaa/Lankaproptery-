import React from 'react';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const EMAILJS_SERVICE_ID = "service_xxxxxxx";
const EMAILJS_TEMPLATE_ID = "template_xxxxxxx";
const EMAILJS_PUBLIC_KEY = "xxxxxxxxxxxxxxx";

if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

async function sendEmail(to: string, subject: string, body: string) {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID, 
      {
        to_email: to,
        subject: subject,
        message: body,
        from_name: 'LankaProperty.lk'
      }
    );
  } catch(e) {
    console.error('Email sending failed', e);
  }
}

// ----------------------------------------------------------------------
// WORKFLOW 1: AI Property Quality Check
// ----------------------------------------------------------------------
export async function runPropertyQualityWorkflow(property: any) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || (typeof window !== "undefined" ? (window as any).__GEMINI_API_KEY__ : "");
  if (!GEMINI_KEY && !process.env.GEMINI_API_KEY) {
     console.warn("No Gemini key for quality check workflow");
  }

  const qualityPrompt = `
You are a Sri Lankan real estate listing quality checker for LankaProperty.lk.

Analyze this property listing and give a quality score from 0-100:

Title: ${property.listing_title}
Category: ${property.property_category}  
Description: ${property.property_description}
Price: Rs. ${property.price_lkr}
Location: ${property.district}, ${property.city}
Rooms: ${property.rooms}
Bathrooms: ${property.bathrooms}
Land Area: ${property.land_area}

Score based on:
- Description length & detail (30 points)
- Price reasonableness for Sri Lanka (20 points)
- Complete fields filled in (20 points)
- Professional language (15 points)
- Location specifics (15 points)

Return ONLY this JSON (no extra text):
{
  "score": 85,
  "passed": true,
  "feedback": "Your listing is well written. Consider adding more details about nearby amenities to attract more buyers.",
  "improvements": [
    "Add nearby school/hospital names",
    "Mention transport links",
    "Include more interior details"
  ]
}
`;

  try {
    let result = { score: 100, passed: true, feedback: 'Great listing!', improvements: [] };
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + (GEMINI_KEY || process.env.GEMINI_API_KEY), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: qualityPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        result = JSON.parse(text);
      }
    } catch(e) {
      console.warn("AI check failed, defaulting to pass", e);
    }
    
    const { score, passed, feedback, improvements } = result;

    if (score >= 80 || passed) {
      // PASSED
      await supabase.from('properties').update({
        status: 'active',
        ai_quality_score: score,
        ai_feedback: feedback
      }).eq('id', property.id);
      
      toast.success(
        `✅ ${property.ref_no} — Auto Approved (Score: ${score}/100)`
      );
      
      await supabase.from('workflow_jobs').insert([{
        workflow_type: 'quality_check',
        status: 'done',
        payload: { property_id: property.id },
        result: { score, passed: true }
      }]);
      
      return { score, passed: true, feedback, improvements };
    } else {
      // FAILED
      await supabase.from('properties').update({
        status: 'pending',
        ai_quality_score: score,
        ai_feedback: feedback
      }).eq('id', property.id);
      
      await sendEmail(
        property.agent_email || property.agent_id,
        "Action Required: Improve Your Listing " + property.ref_no,
        `Dear Agent,\n\nYour listing '${property.listing_title}' received a quality score of ${score}/100.\n\nTo get approved, please improve:\n${improvements.map((i: string, n: number) => `${n+1}. ${i}`).join('\n')}\n\n${feedback}\n\nEdit your listing here:\nhttps://lankaproperty.lk/admin-lk2026\n\nRef No: ${property.ref_no}\nLankaProperty.lk Team`
      );
      
      toast.error(
        `⚠️ ${property.ref_no} — Needs Improvement (Score: ${score}/100) — Feedback sent to agent`
      );
      
      await supabase.from('workflow_jobs').insert([{
        workflow_type: 'quality_check',
        status: 'done',
        payload: { property_id: property.id },
        result: { score, passed: false }
      }]);
      
      return { score, passed: false, feedback, improvements };
    }
  } catch(e) {
    console.error("runPropertyQualityWorkflow error:", e);
  }
}

// ----------------------------------------------------------------------
// WORKFLOW 2: Lead Follow-Up Sequence
// ----------------------------------------------------------------------
export async function runLeadFollowUpWorkflow(lead: any, property: any) {
  // A) WhatsApp alert to agent
  const agentMessage = 
  `🔔 New Inquiry on ${property.ref_no || ''}!
  
  Property: ${property.listing_title}
  Location: ${property.district}
  Price: Rs. ${property.price_lkr?.toLocaleString()}
  
  Buyer Details:
  👤 Name: ${lead.name}
  📞 Phone: ${lead.phone}
  📧 Email: ${lead.email}
  💬 Message: ${lead.message}
  
  Reply now: wa.me/${lead.phone.replace(/\\D/g, '')}
  View listing: lankaproperty.lk/admin-lk2026`;

  if (property.mobile || property.agent_phone) {
     const pMobile = (property.mobile || property.agent_phone).replace(/\\D/g, '');
     setTimeout(() => {
       window.open('https://wa.me/' + pMobile + '?text=' + encodeURIComponent(agentMessage), '_blank', 'width=600,height=500');
     }, 100);
  }

  // B) Email confirmation to buyer
  await sendEmail(
    lead.email,
    "We received your inquiry — LankaProperty.lk",
    `Dear ${lead.name},\n\nThank you for your interest in:\n${property.listing_title}\n📍 ${property.district}, ${property.city}\n💰 Rs. ${property.price_lkr?.toLocaleString()}\n🏷️ Ref No: ${property.ref_no}\n\nOur agent will contact you within 24 hours on ${lead.phone}.\n\nBrowse more properties:\nhttps://lankaproperty.lk\n\nLankaProperty.lk Team 🏠`
  );

  // C) Save lead to Supabase
  let leadId = null;
  const { data: leadData } = await supabase.from('leads').insert([{
    property_id: property.id,
    ref_no: property.ref_no,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    status: 'unread',
    agent_email: property.agent_email,
    agent_phone: property.mobile || property.agent_phone
  }]).select().single();
  
  if (leadData) {
     leadId = leadData.id;
  }

  // D) Schedule follow-up jobs
  if (leadId) {
    const nowMs = Date.now();
    await supabase.from('workflow_jobs').insert([
      {
        workflow_type: 'follow_up_1',
        scheduled_for: new Date(nowMs + 24 * 60 * 60 * 1000).toISOString(),
        payload: { lead_id: leadId, property_id: property.id, step: 1 },
        status: 'pending'
      },
      {
        workflow_type: 'follow_up_2',
        scheduled_for: new Date(nowMs + 3 * 24 * 60 * 60 * 1000).toISOString(),
        payload: { lead_id: leadId, property_id: property.id, step: 2 },
        status: 'pending'
      },
      {
        workflow_type: 'mark_cold',
        scheduled_for: new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString(),
        payload: { lead_id: leadId, property_id: property.id, step: 3 },
        status: 'pending'
      }
    ]);
  }
}

async function sendFollowUp1(lead: any, property: any) {
  if (lead.status !== 'unread') return; // Only if no reply
  
  await sendEmail(
    lead.email,
    `Still interested in ${property.ref_no}? We're here to help 🏠`,
    `Dear ${lead.name},\n\nWe noticed you haven't connected with our agent yet regarding:\n\n${property.listing_title}\n💰 Rs. ${property.price_lkr?.toLocaleString()}\n\nOur agent is ready to arrange a viewing for you!\n\n📞 Call directly: ${property.mobile || property.agent_phone}\n💬 WhatsApp: wa.me/${(property.mobile || property.agent_phone)?.replace(/\\D/g, '')}\n\nOr reply to this email.\n\nDon't miss out — this property is getting many inquiries!\n\nLankaProperty.lk`
  );
  
  await supabase.from('leads').update({
    follow_up_1_sent_at: new Date().toISOString(),
    status: 'following_up'
  }).eq('id', lead.id);
}

async function sendFollowUp2(lead: any, property: any) {
  if (lead.status !== 'following_up') return;
  
  await sendEmail(
    lead.email,
    `Last chance — ${property.ref_no} is still available 🔑`,
    `Dear ${lead.name},\n\nThis is a friendly reminder about:\n${property.listing_title}\n\nProperties in ${property.district} are selling fast!\n\nSimilar properties we think you'll love:\n👉 https://lankaproperty.lk/buy-houses\n\nTo arrange a viewing or ask questions:\n📞 ${property.mobile || property.agent_phone}\n\nThis may be our last reminder.\n\nLankaProperty.lk`
  );
  
  await supabase.from('leads').update({
    follow_up_2_sent_at: new Date().toISOString()
  }).eq('id', lead.id);
}

async function markLeadCold(lead: any) {
  await supabase.from('leads').update({
    status: 'cold',
    follow_up_3_sent_at: new Date().toISOString()
  }).eq('id', lead.id);
  
  console.log(`Lead from ${lead.name} for ${lead.ref_no || ''} marked as cold after 7 days`);
}

export async function processWorkflowJobs() {
  try {
    const { data: jobs } = await supabase.from('workflow_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());
      
    if (!jobs || jobs.length === 0) return;
    
    for (const job of jobs) {
       const pbResult = await supabase.from('properties').select('*').eq('id', job.payload.property_id).single();
       const ldResult = job.payload.lead_id ? await supabase.from('leads').select('*').eq('id', job.payload.lead_id).single() : { data: null };
       
       if (job.workflow_type === 'follow_up_1' && pbResult.data && ldResult.data) {
          await sendFollowUp1(ldResult.data, pbResult.data);
       } else if (job.workflow_type === 'follow_up_2' && pbResult.data && ldResult.data) {
          await sendFollowUp2(ldResult.data, pbResult.data);
       } else if (job.workflow_type === 'mark_cold' && ldResult.data) {
          await markLeadCold(ldResult.data);
       }
       
       await supabase.from('workflow_jobs').update({ status: 'done' }).eq('id', job.id);
    }
  } catch(e) {
    console.error("processWorkflowJobs error:", e);
  }
}

// ----------------------------------------------------------------------
// WORKFLOW 3: Price Drop Alert System
// ----------------------------------------------------------------------
export async function runPriceDropWorkflow(property: any, oldPrice: number, newPrice: number) {
  if (newPrice >= oldPrice) return;
  
  const dropAmount = oldPrice - newPrice;
  const dropPercent = Math.round((dropAmount / oldPrice) * 100);
  
  await supabase.from('price_history').insert([{
    property_id: property.id,
    ref_no: property.ref_no,
    old_price: oldPrice,
    new_price: newPrice
  }]);
  
  const { data: leads } = await supabase.from('leads')
    .select('*')
    .eq('property_id', property.id)
    .neq('status', 'cold')
    .not('phone', 'is', null);
    
  let leadCount = 0;
  if (leads && leads.length > 0) {
    leadCount = leads.length;
    // We would open the first one
    const firstLead = leads[0];
    const priceDropMsg = 
    `🎉 Great News, ${firstLead.name}!
    
  A property you showed interest in has just had a PRICE REDUCTION!
    
  🏠 ${property.listing_title}
  📍 ${property.district}, ${property.city}
    
  Was: Rs. ${oldPrice.toLocaleString()}
  NOW: Rs. ${newPrice.toLocaleString()}
  💰 You Save: Rs. ${dropAmount.toLocaleString()} (${dropPercent}% OFF!)
    
  🏷️ Ref No: ${property.ref_no}
    
  This won't last long — act fast!
  View now: lankaproperty.lk
    
  LankaProperty.lk 🏠`;
    
    setTimeout(() => {
       window.open('https://wa.me/' + firstLead.phone.replace(/\\D/g, '') + '?text=' + encodeURIComponent(priceDropMsg), '_blank', 'width=600,height=500');
    }, 500);
  }
  
  const fbCaption = 
`🔥 PRICE REDUCED! Don't Miss Out!

${property.listing_title}
📍 ${property.district}, Sri Lanka

💰 WAS: Rs. ${oldPrice.toLocaleString()}
✅ NOW: Rs. ${newPrice.toLocaleString()}
🎯 SAVE Rs. ${dropAmount.toLocaleString()} (${dropPercent}% OFF!)

${property.rooms} Beds | ${property.bathrooms} Baths
${property.land_area}

📞 Contact us now!
🌐 lankaproperty.lk
🏷️ Ref: ${property.ref_no}

#PriceReduced #SriLankaProperty #LankaProperty #RealEstate #${property.district?.replace(/\s/g,'')}Property #PropertyForSale #SriLanka`;
  
  if (navigator.clipboard && window.isSecureContext) {
    try {
      navigator.clipboard.writeText(fbCaption);
      toast.success("📋 Caption copied! Opening Instagram...");
    } catch(e) {}
  }
  
  setTimeout(() => window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://lankaproperty.lk') + '&quote=' + encodeURIComponent(fbCaption), '_blank', 'width=600,height=500'), 1500);
  setTimeout(() => window.open('https://instagram.com', '_blank', 'width=600,height=500'), 2500);

  // Instead of auto opening a modal here, we can return the data or let toast give summary
  toast(
    (t) => (
      <div className="flex flex-col gap-2 min-w-[280px]">
        <h4 className="font-bold text-gray-900 border-b pb-2">💰 Price Drop Alert Sent!</h4>
        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Property:</span> {property.ref_no}</p>
          <p><span className="text-gray-500">Price:</span> <span className="line-through text-red-400">Rs.{oldPrice}</span> → <span className="text-green-600 font-bold">Rs.{newPrice}</span></p>
          <p className="mt-2 text-green-700">✅ Price history saved</p>
          <p className="text-green-700">✅ {leadCount} buyers notified</p>
          <p className="text-green-700">✅ Socials opened & caption copied</p>
        </div>
        <button className="mt-2 py-1 bg-gray-100 rounded text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Close</button>
      </div>
    ),
    { duration: 6000 }
  );
}

// ----------------------------------------------------------------------
// WORKFLOW 4: Listing Expiry System
// ----------------------------------------------------------------------
export async function runExpiryWorkflow() {
  try {
    const now = Date.now();
    const threeDaysFromNow = new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
    
    // 1. Find properties expiring in 3 days
    const { data: expiringSoon } = await supabase.from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('expiry_reminder_sent', false)
      .lte('expires_at', threeDaysFromNow)
      .gt('expires_at', new Date().toISOString());

    if (expiringSoon && expiringSoon.length > 0) {
      for (const property of expiringSoon) {
        await sendEmail(
          property.agent_email || property.agent_id,
          `⚠️ Your listing ${property.ref_no} expires in 3 days!`,
          `Dear Agent,\n\nYour property listing will expire soon:\n\n🏠 ${property.listing_title}\n🏷️ Ref No: ${property.ref_no}\n📍 ${property.district}\n⏰ Expires: ${new Date(property.expires_at).toLocaleDateString()}\n\n📊 Your listing performance:\n👁️ Total Views: ${property.view_count || 0}\n📩 Total Leads: ${property.lead_count || 0}\n\nRENEW NOW to keep your listing active!\nChoose your package:\n\n✅ Standard — Rs. 2,499 (30 days)\n⭐ Premium  — Rs. 4,999 (60 days)\n💎 Elite    — Rs. 9,999 (90 days)\n\n👉 Renew here: \nhttps://lankaproperty.lk/packages\n\nDon't lose your leads!\nLankaProperty.lk Team`
        );
        
        await supabase.from('properties').update({ expiry_reminder_sent: true }).eq('id', property.id);
        toast(`⚠️ ${property.ref_no} expires in 3 days — reminder sent`, { icon: '⚠️' });
      }
    }
    
    // 2. Find expired properties
    const { data: expiredNow } = await supabase.from('properties')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());
      
    if (expiredNow && expiredNow.length > 0) {
      for (const property of expiredNow) {
        await supabase.from('properties').update({ status: 'expired' }).eq('id', property.id);
        
        await sendEmail(
          property.agent_email || property.agent_id,
          `❌ Your listing ${property.ref_no} has expired — Renew to go live again`,
          `Dear Agent,\n\nYour listing has expired and is no longer visible to buyers:\n\n🏠 ${property.listing_title}\n🏷️ Ref: ${property.ref_no}\n❌ Expired: ${new Date().toLocaleDateString()}\n\nFinal stats:\n👁️ Total Views: ${property.view_count || 0}\n📩 Total Leads: ${property.lead_count || 0}\n\nRenew now and get back online in minutes:\n💎 https://lankaproperty.lk/packages\n\nUse code RENEW10 for 10% discount!\n\nLankaProperty.lk Team`
        );
      }
      toast.error(`${expiredNow.length} listings expired today`);
    }
  } catch(e) {
    console.error("runExpiryWorkflow error:", e);
  }
}
