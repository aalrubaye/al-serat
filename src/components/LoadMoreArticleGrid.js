'use client'

import { useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'

export default function LoadMoreArticleGrid({
  articles,
  initialCount = 10,
  step = 10,
}) {
  const safeArticles = useMemo(() => articles || [], [articles])
  const initialVisibleCount = Math.min(initialCount, safeArticles.length)
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)

  const visibleArticles = safeArticles.slice(0, visibleCount)
  const hasMore = visibleCount < safeArticles.length

  function handleLoadMore() {
    setVisibleCount((current) => Math.min(current + step, safeArticles.length))
  }

  return (
    <>
      <div className="secondary-cards-grid">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} compact />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button
            type="button"
            className="load-more-btn"
            onClick={handleLoadMore}
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </>
  )
}
