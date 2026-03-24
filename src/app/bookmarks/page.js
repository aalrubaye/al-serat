'use client'

import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import LoadMoreArticleGrid from '../../components/LoadMoreArticleGrid'
import PublicBackButton from '../../components/PublicBackButton'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

export default function BookmarksPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookmarks() {
      const ids = JSON.parse(localStorage.getItem('favorites') || '[]')

      if (!ids.length) {
        setArticles([])
        setLoading(false)
        return
      }

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        setArticles([])
        setLoading(false)
        return
      }

      const payload = await response.json()
      setArticles(Array.isArray(payload.articles) ? payload.articles : [])
      setLoading(false)
    }

    loadBookmarks()
  }, [])

  return (
    <div>
      <Header />
      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/" />
            </div>

            <div className="topic-page-header">
              <div className="page-title-with-pill">
                <h1 className="page-title">المفضلة</h1>
                {!loading && articles.length > 0 && (
                  <span className="topic-count-pill">
                    {formatArabicNumber(articles.length)} منشور
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <p>جاري التحميل...</p>
            ) : articles.length ? (
              <LoadMoreArticleGrid
                articles={articles}
                initialCount={10}
                step={10}
              />
            ) : (
              <p>لا توجد منشورات في المفضلة</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
