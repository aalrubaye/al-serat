'use client'

import { useEffect, useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  message: '',
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status.type !== 'success' || !status.message) return undefined

    const timeoutId = window.setTimeout(() => {
      setStatus((current) =>
        current.type === 'success' ? { type: '', message: '' } : current
      )
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [status])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'تعذر إرسال الرسالة حالياً.')
      }

      setForm(initialForm)
      setStatus({
        type: 'success',
        message: 'تم إرسال رسالتك بنجاح. سنطّلع عليها في أقرب وقت.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'حدث خطأ أثناء إرسال الرسالة.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="contact-form-card" onSubmit={handleSubmit}>
      <div className="contact-form-grid">
        <label className="contact-field">
          <span className="contact-field-label">
            الاسم <span className="contact-required-star">*</span>
          </span>
          <input
            type="text"
            name="name"
            className="contact-input"
            value={form.name}
            onChange={updateField}
            placeholder="الاسم الكامل"
            autoComplete="name"
            maxLength={120}
          />
        </label>

        <label className="contact-field">
          <span className="contact-field-label">البريد الإلكتروني</span>
          <input
            type="email"
            name="email"
            className="contact-input"
            value={form.email}
            onChange={updateField}
            placeholder="name@example.com"
            autoComplete="email"
            maxLength={160}
            dir="ltr"
          />
        </label>
      </div>

      <label className="contact-field">
        <span className="contact-field-label">
          الرسالة <span className="contact-required-star">*</span>
        </span>
        <textarea
          name="message"
          className="contact-textarea"
          value={form.message}
          onChange={updateField}
          placeholder="اكتب رسالتك هنا..."
          required
          maxLength={4000}
          rows={8}
        />
      </label>

      {status.message ? (
        status.type === 'success' ? (
          <div className="contact-toast-wrap" aria-live="polite">
            <div className="contact-form-status is-success contact-toast">
              <span className="contact-toast-icon" aria-hidden="true">
                ✓
              </span>
              <span className="contact-toast-text">{status.message}</span>
            </div>
          </div>
        ) : (
          <p className={`contact-form-status is-${status.type}`}>{status.message}</p>
        )
      ) : null}

      <div className="contact-form-actions">
        <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
        </button>
      </div>
    </form>
  )
}
