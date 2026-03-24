'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    await fetch('/api/admin/session', {
      method: 'DELETE',
    })

    setLoading(false)
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      className="admin-action-btn admin-delete-btn"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
    </button>
  )
}
