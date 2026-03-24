'use client'

import { useEffect, useState } from 'react'

export default function FavoritePillButton({ articleId, compact = false }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFav(saved.includes(articleId))
  }, [articleId])

  function toggleFav(e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    let saved = JSON.parse(localStorage.getItem('favorites') || '[]')

    if (saved.includes(articleId)) {
      saved = saved.filter((id) => id !== articleId)
      setFav(false)
    } else {
      saved.push(articleId)
      setFav(true)
    }

    localStorage.setItem('favorites', JSON.stringify(saved))
  }

  return (
    <button
      type="button"
      className={`favorite-icon-btn ${fav ? 'is-fav' : ''} ${compact ? 'compact' : ''}`}
      onClick={toggleFav}
      aria-label={fav ? 'في المفضلة' : 'مفضلة'}
      title={fav ? 'في المفضلة' : 'مفضلة'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.25 3.25h9.5c.69 0 1.25.56 1.25 1.25v15.05c0 .56-.64.88-1.09.55L12 16.7l-4.91 3.4c-.45.31-1.09.01-1.09-.55V4.5c0-.69.56-1.25 1.25-1.25Z" />
      </svg>
      <span>مفضلة</span>
    </button>
  )
}