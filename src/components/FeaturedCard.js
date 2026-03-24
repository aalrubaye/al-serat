'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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

export default function FeaturedCard({ article }) {
  const [isPortraitImage, setIsPortraitImage] = useState(false)
  const thumbnail =
    article.image ||
    extractYoutubeThumbnail(article.content) ||
    extractFirstImage(article.content)

  const allVisibleTags = (Array.isArray(article.tags) ? article.tags : [])
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag) => !INTERNAL_TAGS.includes(tag))
  const visibleTags = allVisibleTags.slice(0, 3)
  const remainingTagCount = Math.max(allVisibleTags.length - visibleTags.length, 0)

  const gregorianDate = useMemo(
    () => formatGregorianDate(article.created_at),
    [article.created_at]
  )

  const hijriDate = useMemo(
    () => formatHijriDate(article.created_at),
    [article.created_at]
  )

  return (
    <article className="featured-card">
      <div className="featured-card-inner">
        <Link href={`/article/${article.slug}`} className="featured-card-main-link">
          {thumbnail && (
            <div
              className={`featured-image-wrap ${isPortraitImage ? 'is-portrait-image' : ''}`}
            >
              <img
                src={thumbnail}
                alt={article.title}
                className={`featured-image ${isPortraitImage ? 'is-portrait-image' : ''}`}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget
                  setIsPortraitImage(naturalHeight > naturalWidth * 1.12)
                }}
              />

              {article.content_type === 'video' && (
                <div className="featured-play-icon">
                  <span className="featured-play-triangle">▶</span>
                </div>
              )}
            </div>
          )}

          <div className="featured-content">
            <div className="featured-meta">
              {article.topic_name && <span className="featured-topic">{article.topic_name}</span>}
            </div>

            <h1 className="featured-title">{article.title}</h1>

            {article.summary && (
              <p className="featured-summary">{article.summary}</p>
            )}
          </div>
        </Link>

        {visibleTags.length > 0 && (
          <div className="featured-card-tags">
            {visibleTags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="featured-card-tag-btn"
              >
                {tag}
              </Link>
            ))}

            {remainingTagCount > 0 && (
              <span className="featured-card-tag-btn article-card-tag-overflow">
                +{remainingTagCount}
              </span>
            )}
          </div>
        )}

        <div className="featured-footer">
          <div className="featured-dates">
            <span className="featured-hijri">{hijriDate}</span>
            <span className="featured-date-separator">-</span>
            <span className="featured-date">{gregorianDate}</span>
          </div>

          <div className="featured-actions">
            <FavoritePillButton articleId={article.id} compact />
            <ShareMenuButton
              title={article.title}
              summary={article.summary}
              url={`/article/${article.slug}`}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  )
}
