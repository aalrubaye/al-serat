'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const [activeFilter, setActiveFilter] = useState('all')
  const showHomeFilter = pathname === '/'

  useEffect(() => {
    if (pathname !== '/') {
      setActiveFilter('all')
      return
    }

    const params = new URLSearchParams(window.location.search)
    setActiveFilter(params.get('type') || 'all')
  }, [pathname])

  const links = [
    { href: '/', label: 'الرئيسية', active: pathname === '/' },
    {
      href: '/topics',
      label: 'الأقسام',
      active: pathname === '/topics' || pathname.startsWith('/topics/'),
    },
    { href: '/bookmarks', label: 'المفضلة', active: pathname === '/bookmarks' },
    { href: '/about', label: 'عن الصراط', active: pathname === '/about' },
    { href: '/contact', label: 'اتصل بنا', active: pathname === '/contact' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-topbar">
        <div className="sidebar-topbar-inner">
          <nav className="sidebar-links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.active ? 'is-active' : undefined}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {showHomeFilter && (
            <div className="sidebar-home-filter" aria-label="تصفية المحتوى">
              <span className="sidebar-row-label">عرض</span>
              <div className="sidebar-home-filter-links">
                <Link
                  href="/"
                  className={activeFilter === 'all' ? 'is-active' : undefined}
                >
                  الكل
                </Link>
                <Link
                  href="/?type=article"
                  className={activeFilter === 'article' ? 'is-active' : undefined}
                >
                  مقال
                </Link>
                <Link
                  href="/?type=video"
                  className={activeFilter === 'video' ? 'is-active' : undefined}
                >
                  فيديو
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
