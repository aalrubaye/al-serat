'use client'

import { useEffect, useState } from 'react'

export default function ArticleFavoriteButton({ articleId }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFav(saved.includes(articleId))
  }, [articleId])

  function toggleFav() {
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
      className={`fav-btn ${fav ? 'is-fav' : ''}`}
      onClick={toggleFav}
      aria-label="إضافة إلى المفضلة"
      title="إضافة إلى المفضلة"
    >
      {fav ? '★' : '☆'}
    </button>
  )
}