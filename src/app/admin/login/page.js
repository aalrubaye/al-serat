'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'فشل تسجيل الدخول، تأكد من البريد الإلكتروني وكلمة المرور')
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <main className="admin-page">
      <div className="admin-card">
        <h1>تسجيل دخول الإدارة</h1>

        <form onSubmit={handleLogin} className="admin-form">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </main>
  )
}
