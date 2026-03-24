'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteArticleButton({ articleId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const ok = window.confirm('هل أنت متأكد من حذف هذا المقال؟')
    if (!ok) return

    setLoading(true)

    const res = await fetch(`/admin/delete/${articleId}`, {
      method: 'POST',
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء حذف المقال')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      className="admin-action-btn admin-delete-btn"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'جارٍ الحذف...' : 'حذف'}
    </button>
  )
}