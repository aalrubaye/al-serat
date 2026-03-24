'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeatureArticleButton({ articleId, isFeatured = false, disabled = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (disabled || isFeatured) return

    setLoading(true)

    const res = await fetch(`/admin/update/${articleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        featured: true,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء تحديث المقال المميز')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      className={`admin-action-btn admin-featured-btn ${isFeatured ? 'active' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading || isFeatured}
      title={isFeatured ? 'هذا هو المقال المميز الحالي' : 'تعيين كمقال مميز'}
    >
      {loading ? 'جاري التحديث...' : isFeatured ? 'مميز حالياً' : 'تمييز المقال'}
    </button>
  )
}
