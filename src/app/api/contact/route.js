import { NextResponse } from 'next/server'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request) {
  const body = await request.json()
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim()
  const message = String(body?.message || '').trim()

  if (!message) {
    return NextResponse.json(
      { error: 'يرجى كتابة الرسالة قبل الإرسال.' },
      { status: 400 }
    )
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'يرجى إدخال بريد إلكتروني صحيح.' },
      { status: 400 }
    )
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: 'يرجى كتابة رسالة أوضح قبل الإرسال.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  const contactToEmail = process.env.CONTACT_TO_EMAIL
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Al-Serat <onboarding@resend.dev>'

  if (!apiKey || !contactToEmail) {
    return NextResponse.json(
      { error: 'خدمة البريد غير مهيأة بعد.' },
      { status: 500 }
    )
  }

  const safeName = escapeHtml(name || 'غير مذكور')
  const safeEmail = escapeHtml(email || 'غير مذكور')
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contactToEmail],
      subject: `رسالة جديدة من اتصل بنا - ${name || 'مرسل بدون اسم'}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #10241c;">
          <h2 style="margin: 0 0 16px;">رسالة جديدة من نموذج اتصل بنا</h2>
          <p style="margin: 0 0 8px;"><strong>الاسم:</strong> ${safeName}</p>
          <p style="margin: 0 0 8px;"><strong>البريد الإلكتروني:</strong> ${safeEmail}</p>
          <div style="margin-top: 18px; padding: 16px; border: 1px solid #d8e1dc; border-radius: 12px; background: #f8fbf9;">
            ${safeMessage}
          </div>
        </div>
      `,
      text: `رسالة جديدة من نموذج اتصل بنا\n\nالاسم: ${name || 'غير مذكور'}\nالبريد الإلكتروني: ${email || 'غير مذكور'}\n\nالرسالة:\n${message}`,
    }),
  })

  const resendResult = await resendResponse.json()

  if (!resendResponse.ok) {
    return NextResponse.json(
      {
        error:
          resendResult?.message ||
          resendResult?.error ||
          'تعذر إرسال الرسالة حالياً.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: resendResult.id })
}
