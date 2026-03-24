'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') || '')
  }, [])

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <img
            src="/logo_banner.png"
            alt="شعار الصراط"
            className="logo-banner-mark"
          />
          <span className="logo-text">الصراط</span>
        </Link>

        <form className="header-search-wrap" action="/search" method="get">
          <input
            key={query}
            name="q"
            type="search"
            className="search"
            placeholder="ابحث ..."
            defaultValue={query}
            aria-label="ابحث في موقع الصراط"
          />
        </form>
      </div>
    </header>
  )
}
