'use client'

import { useRouter } from 'next/navigation'

export default function PublicBackButton({ fallbackHref = '/' }) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button type="button" className="public-back-button" onClick={handleBack}>
      <span>رجوع</span>
      <span aria-hidden="true" className="public-back-button-icon">
        ←
      </span>
    </button>
  )
}
