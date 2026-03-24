'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
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

      const { data: topics } = await supabase
        .from('topics')
        .select('id, name')

      const topicMap = Object.fromEntries(
        (topics || []).map((topic) => [topic.id, topic.name])
      )

      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, summary, content, created_at, topic_id, image, content_type, status, tags')
        .in('id', ids)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      const enriched = (data || []).map((article) => ({
        ...article,
        topic_name: topicMap[article.topic_id] || '',
      }))

      setArticles(enriched)
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
