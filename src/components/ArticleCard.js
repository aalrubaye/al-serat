'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import FavoritePillButton from './FavoritePillButton'
import ShareMenuButton from './ShareMenuButton'

const INTERNAL_TAGS = ['__featured__']

function extractYoutubeThumbnail(html) {
  if (!html) return null

  const match =
    html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/) ||
    html.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/) ||
    html.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)

  if (!match) return null
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
}

function extractFirstImage(html) {
  if (!html) return null
  const match = html.match(/<img[^>]+src="([^"]+)"/i)
  return match ? match[1] : null
}

function getThumbnail(article) {
  return (
    article.image ||
    extractYoutubeThumbnail(article.content) ||
    extractFirstImage(article.content) ||
    null
  )
}

function formatGregorianDate(date) {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function formatHijriDate(date) {
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export default function ArticleCard({
  article,
  compact = false,
  showTopic = true,
  showTags = true,
  showActions = true,
  showFooter = true,
  className = '',
}) {
  const router = useRouter()
  const [isPortraitImage, setIsPortraitImage] = useState(false)

  function goToTag(e, tag) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/tags/${encodeURIComponent(tag)}`)
  }

  const thumbnail = getThumbnail(article)
  const summary = article.summary ? String(article.summary).trim() : ''

  const visibleTags = (Array.isArray(article.tags) ? article.tags : [])
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag) => !INTERNAL_TAGS.includes(tag))
    .slice(0, 3)

  const gregorianDate = useMemo(
    () => formatGregorianDate(article.created_at),
    [article.created_at]
  )

  const hijriDate = useMemo(
    () => formatHijriDate(article.created_at),
    [article.created_at]
  )

  return (
    <Link href={`/article/${article.slug}`} className="article-card-link">
      <article
        className={`article-card modern-card ${compact ? 'compact-card' : ''} ${className}`.trim()}
      >
        {thumbnail && (
          <div
            className={`article-card-top-image-wrap ${isPortraitImage ? 'is-portrait-image' : ''}`}
          >
            <img
              src={thumbnail}
              alt={article.title}
              className={`article-card-top-image ${isPortraitImage ? 'is-portrait-image' : ''}`}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget
                setIsPortraitImage(naturalHeight > naturalWidth * 1.12)
              }}
            />

            {article.content_type === 'video' && (
              <div className="play-icon">▶</div>
            )}
          </div>
        )}

        <div className="article-card-content">
          <div className="article-card-top-meta">
            {showTopic && article.topic_name && (
              <div className="article-card-topic">{article.topic_name}</div>
            )}
          </div>

          <h3 className="article-card-title">{article.title}</h3>

          {summary && <p className="article-card-summary">{summary}</p>}
        </div>

        {showTags && visibleTags.length > 0 && (
          <div className="article-card-tags">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="article-card-tag-btn"
                onClick={(e) => goToTag(e, tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {showFooter && (
          <div className="article-card-footer">
            <div className="article-card-dates">
              <span className="article-card-hijri">{hijriDate}</span>
              <span className="article-card-date-separator">-</span>
              <span className="article-card-date">{gregorianDate}</span>
            </div>

            {showActions && (
              <div className="article-card-actions">
                <FavoritePillButton articleId={article.id} compact />
                <ShareMenuButton
                  title={article.title}
                  summary={article.summary}
                  url={`/article/${article.slug}`}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
