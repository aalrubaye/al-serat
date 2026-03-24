'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PublishArticleButton({ articleId, disabled = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePublish() {
    if (disabled) return

    setLoading(true)

    const res = await fetch(`/admin/update/${articleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'published',
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء النشر')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      className="admin-action-btn admin-publish-btn"
      onClick={handlePublish}
      disabled={disabled || loading}
    >
      {loading ? 'جاري النشر...' : 'نشر'}
    </button>
  )
}
