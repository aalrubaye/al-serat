'use client'

import { useRouter } from 'next/navigation'

export default function AdminBackLink({
  href = '/admin/dashboard',
  children = 'ارجع للوحة الإدارة',
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      className="admin-back-link"
      onClick={() => router.push(href)}
    >
      <span aria-hidden="true" className="admin-back-link-icon">
        ←
      </span>
      <span>{children}</span>
    </button>
  )
}
