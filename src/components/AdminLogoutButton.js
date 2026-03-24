'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    await supabase.auth.signOut()

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
      {loading ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
    </button>
  )
}