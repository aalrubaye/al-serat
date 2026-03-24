'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20.5V12c0-1.38 1.12-2.5 2.5-2.5H11V5l9 7-9 7v-4.5H8.5A4.5 4.5 0 0 0 4 19v1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.05 2A9.9 9.9 0 0 0 3.54 17l-1.1 4.1 4.23-1.12A9.93 9.93 0 1 0 12.05 2Z"
        fill="#ffffff"
      />
      <path
        d="M12.05 3.7a8.25 8.25 0 0 0-7.08 12.5l.27.44-.68 2.52 2.59-.69.42.25a8.23 8.23 0 1 0 4.48-15.02Z"
        fill="#57d163"
      />
      <path
        d="M8.78 7.3c-.3 0-.54.07-.73.3-.36.39-1.06 1.08-1.02 2.4.04 1.32.92 2.63 1.05 2.8.14.17 1.8 2.8 4.45 3.88.63.27 1.13.42 1.52.54.65.2 1.23.15 1.69.09.52-.08 1.53-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.24-.18-.5-.32-.26-.13-1.5-.74-1.73-.82-.24-.08-.41-.12-.58.12-.18.24-.67.82-.82.98-.15.17-.31.18-.57.06-.26-.13-1.1-.4-2.09-1.29-.78-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.11-.12.26-.3.39-.45.12-.15.17-.26.26-.43.09-.18.05-.33-.02-.46-.07-.13-.58-1.4-.79-1.92-.17-.42-.35-.55-.52-.56h-.44Z"
        fill="#ffffff"
      />
    </svg>
  )
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.54-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.5 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/>
      <path fill="#fff" d="M16.67 15.56l.53-3.49h-3.33V9.81c0-.95.46-1.88 1.96-1.88h1.51V4.96s-1.37-.24-2.68-.24c-2.75 0-4.54 1.67-4.54 4.69v2.66H7.08v3.49h3.04V24a12.2 12.2 0 0 0 3.75 0v-8.44h2.8Z"/>
    </svg>
  )
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.89-7.43L5.56 22H2.45l7.24-8.28L1.98 2h6.4l4.42 6.75L18.9 2Zm-1.1 18h1.72L7.43 3.9H5.58L17.8 20Z"/>
    </svg>
  )
}

function TelegramGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#229ED9" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Z"/>
      <path fill="#fff" d="m17.67 7.4-2.04 9.62c-.15.68-.56.85-1.13.53l-3.13-2.31-1.51 1.46c-.17.17-.31.31-.64.31l.23-3.2 5.82-5.26c.25-.23-.06-.36-.39-.14L7.7 12.94l-3.08-.96c-.67-.21-.69-.67.14-.99l12.03-4.64c.56-.21 1.04.14.88 1.05Z"/>
    </svg>
  )
}

function EmailGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4.5 7 7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function normalizeShareLine(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export default function ShareMenuButton({ title, summary, url }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 })
  const wrapRef = useRef(null)
  const menuRef = useRef(null)

  const absoluteUrl = useMemo(() => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (typeof window !== 'undefined') return `${window.location.origin}${url}`
    return url
  }, [url])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return

    function updatePosition() {
      const rect = wrapRef.current.getBoundingClientRect()
      const menuWidth = 250
      const viewportWidth = window.innerWidth
      const left = Math.max(12, Math.min(rect.left, viewportWidth - menuWidth - 12))
      const top = rect.bottom + 10

      setMenuStyle({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  function setTemporaryNote(message) {
    setNote(message)
    window.clearTimeout(window.__shareNoteTimeout)
    window.__shareNoteTimeout = window.setTimeout(() => setNote(''), 1800)
  }

  async function handleNativeShare(e) {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareMessage,
          url: absoluteUrl,
        })
      } else {
        await navigator.clipboard.writeText(absoluteUrl)
        setTemporaryNote('تم نسخ الرابط')
      }
    } catch {}

    setOpen(false)
  }

  async function handleCopyLink(e) {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setTemporaryNote('تم نسخ الرابط')
    } catch {}

    setOpen(false)
  }

  const cleanTitle = normalizeShareLine(title)
  const cleanSummary = normalizeShareLine(summary)

  const shareMessage = [
    cleanTitle,
    cleanSummary,
    absoluteUrl,
    'مشاركة من موقع الصراط',
  ]
    .filter(Boolean)
    .join('\n')

  const encodedUrl = encodeURIComponent(absoluteUrl)
  const encodedTitle = encodeURIComponent(cleanTitle)
  const encodedShareMessage = encodeURIComponent(shareMessage)
  const encodedEmailBody = encodeURIComponent(
    [cleanTitle, cleanSummary, '', absoluteUrl, '', 'مشاركة من موقع الصراط']
      .filter(Boolean)
      .join('\n')
  )

  const items = [
    {
      href: `https://wa.me/?text=${encodedShareMessage}`,
      label: 'واتساب',
      icon: <WhatsAppGlyph />,
      itemClassName: 'share-menu-item-whatsapp',
      iconClassName: 'share-menu-icon-whatsapp',
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'فيسبوك',
      icon: <FacebookGlyph />,
    },
    {
      href: `https://twitter.com/intent/tweet?text=${encodedShareMessage}`,
      label: 'ايكس (تويتر)',
      icon: <XGlyph />,
    },
    {
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedShareMessage}`,
      label: 'تيليغرام',
      icon: <TelegramGlyph />,
    },
    {
      href: `mailto:?subject=${encodedTitle}&body=${encodedEmailBody}`,
      label: 'البريد',
      icon: <EmailGlyph />,
    },
  ]

  return (
    <div
      className="share-menu-wrap"
      ref={wrapRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="share-icon-btn"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        aria-label="مشاركة"
        title="مشاركة"
        aria-expanded={open}
      >
        <ShareGlyph />
        <span>مشاركة</span>
      </button>

      {open &&
        createPortal(
          <div className="share-menu" ref={menuRef} style={menuStyle}>
            <div className="share-menu-group">
              <button type="button" className="share-menu-item" onClick={handleNativeShare}>
                <span className="share-menu-icon">
                  <ShareGlyph />
                </span>
                <span className="share-menu-label">مشاركة…</span>
              </button>

              <button type="button" className="share-menu-item" onClick={handleCopyLink}>
                <span className="share-menu-icon">
                  <CopyGlyph />
                </span>
                <span className="share-menu-label">نسخ الرابط</span>
              </button>
            </div>

            <div className="share-menu-group">
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`share-menu-item ${item.itemClassName || ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className={`share-menu-icon ${item.iconClassName || ''}`}>
                    {item.icon}
                  </span>
                  <span className="share-menu-label">{item.label}</span>
                </a>
              ))}
            </div>

            {note && <div className="share-menu-note">{note}</div>}
          </div>,
          document.body
        )}
    </div>
  )
}
