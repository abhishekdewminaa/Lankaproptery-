import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  try {
    const { type, data } = await req.json()

    if (type === 'new_inquiry') {
      await sendInquiryEmail(data)
      await sendWhatsAppAlert(data)
    } else if (type === 'new_agent') {
      await sendWelcomeEmail(data)
    } else if (type === 'new_property') {
      await sendNewPropertyNotification(data)
    } else if (type === 'inquiry_status_change') {
      await sendStatusChangeEmail(data)
    }

    return new Response(JSON.stringify({ status: 'OK' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

const sendInquiryEmail = async (data: any) => {
  const emailBody = `
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
  `

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not defined in edge function');
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LankaProperty.lk <noreply@lankaproperty.lk>',
      to: [data.agent_email],
      subject: `🏠 New Inquiry: ${data.property_title || 'Property Inquiry'}`,
      html: emailBody
    })
  })
}

const sendWelcomeEmail = async (data: any) => {
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #004F31; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">LankaProperty.lk</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #004F31;">Welcome to LankaProperty.lk!</h2>
        <p>Dear ${data.name || 'Agent'},</p>
        <p>Your agent account has been registered successfully. You can now publish properties and receive verified customer leads directly.</p>
        <p>Enjoy listing on Sri Lanka's leading real estate portal!</p>
        <a href="https://lankaproperty.lk/admin-lk2026" style="background: #004F31; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Access Agent Portal
        </a>
      </div>
      <div style="background: #004F31; padding: 16px; text-align: center; color: #A7F3D0; font-size: 12px;">
        © 2026 LankaProperty.lk
      </div>
    </div>
  `

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LankaProperty.lk <noreply@lankaproperty.lk>',
      to: [data.email],
      subject: 'Welcome to LankaProperty.lk!',
      html: emailBody
    })
  })
}

const sendNewPropertyNotification = async (data: any) => {
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #004F31; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">LankaProperty.lk</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #004F31;">🏠 New Property Published</h2>
        <p>A new property has been published on the platform:</p>
        <p><b>Title:</b> ${data.title}</p>
        <p><b>Price:</b> Rs. ${Number(data.price_lkr).toLocaleString()}</p>
        <p><b>Category:</b> ${data.category || 'N/A'}</p>
      </div>
    </div>
  `

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LankaProperty.lk <noreply@lankaproperty.lk>',
      to: [data.agent_email || 'admin@lankaproperty.lk'],
      subject: `New Property Published: ${data.title}`,
      html: emailBody
    })
  })
}

const sendStatusChangeEmail = async (data: any) => {
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #004F31; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">LankaProperty.lk</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #004F31;">💬 Inquiry Status Updated</h2>
        <p>An inquiry status has been updated to: <b>${data.new_status}</b></p>
        <p><b>Client Info:</b> ${data.client_name}</p>
        <p><b>Property:</b> ${data.property_title}</p>
      </div>
    </div>
  `

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LankaProperty.lk <noreply@lankaproperty.lk>',
      to: [data.agent_email],
      subject: `Inquiry Status Updated: ${data.property_title}`,
      html: emailBody
    })
  })
}

const sendWhatsAppAlert = async (data: any) => {
  if (!data.agent_phone || !data.agent_whatsapp_key) return;

  const phone = data.agent_phone.replace(/[^0-9]/g, '')
  const apiKey = data.agent_whatsapp_key

  const message = 
    `🏠 *New Property Inquiry!*\n\n` +
    `*Property:* ${data.property_title || 'Property'}\n` +
    `*Location:* ${data.district || 'Sri Lanka'}\n\n` +
    `👤 *Buyer Details:*\n` +
    `Name: ${data.client_name || 'N/A'}\n` +
    `Phone: ${data.client_phone || 'N/A'}\n` +
    `Email: ${data.client_email || 'N/A'}\n\n` +
    `💬 *Message:*\n${data.message || 'N/A'}\n\n` +
    `View dashboard: https://lankaproperty.lk/admin-lk2026`

  await fetch(
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${phone}` +
    `&text=${encodeURIComponent(message)}` +
    `&apikey=${apiKey}`
  )
}
