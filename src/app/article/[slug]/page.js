import { supabase } from '../../../lib/supabase'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import Link from 'next/link'
import FavoritePillButton from '../../../components/FavoritePillButton'
import ShareMenuButton from '../../../components/ShareMenuButton'
import ArticleCard from '../../../components/ArticleCard'
import PublicBackButton from '../../../components/PublicBackButton'
import PrintButton from '../../../components/PrintButton'

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

function getArticleThumbnail(article) {
  return (
    article?.image ||
    extractYoutubeThumbnail(article?.content) ||
    extractFirstImage(article?.content) ||
    null
  )
}

function normalizeSummary(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function toAbsoluteUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL

  if (!siteUrl) return path

  const base = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  return new URL(path, base).toString()
}

async function getPublishedArticle(slug) {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  return article
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getPublishedArticle(slug)

  if (!article) {
    return {
      title: 'المقال غير موجود | الصراط',
    }
  }

  const articleUrl = toAbsoluteUrl(`/article/${article.slug}`)
  const thumbnail = toAbsoluteUrl(getArticleThumbnail(article))
  const summary = normalizeSummary(article.summary)

  return {
    title: article.title,
    description: summary || 'مشاركة من موقع الصراط',
    openGraph: {
      title: article.title,
      description: summary || 'مشاركة من موقع الصراط',
      url: articleUrl || `/article/${article.slug}`,
      type: 'article',
      images: thumbnail ? [{ url: thumbnail }] : undefined,
    },
    twitter: {
      card: thumbnail ? 'summary_large_image' : 'summary',
      title: article.title,
      description: summary || 'مشاركة من موقع الصراط',
      images: thumbnail ? [thumbnail] : undefined,
    },
  }
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

export default async function ArticlePage({ params }) {
  const { slug } = await params

  const article = await getPublishedArticle(slug)

  if (!article) {
    return (
      <div>
        <Header />
        <div className="layout">
          <Sidebar />
          <main className="main">
            <h2>المقال غير موجود</h2>
            <Link href="/">العودة إلى الرئيسية</Link>
          </main>
        </div>
      </div>
    )
  }

  const { data: sameTopicArticles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('topic_id', article.topic_id)
    .eq('content_type', article.content_type)
    .neq('id', article.id)
    .order('created_at', { ascending: false })
    .limit(3)

  let similarArticles = sameTopicArticles || []

  if (similarArticles.length < 3) {
    const excludedIds = [article.id, ...similarArticles.map((item) => item.id)]

    let fallbackQuery = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', article.id)
      .order('created_at', { ascending: false })
      .limit(6)

    if (article.content_type) {
      fallbackQuery = fallbackQuery.eq('content_type', article.content_type)
    }

    const { data: fallbackArticles } = await fallbackQuery

    const fallbackMatches = (fallbackArticles || []).filter(
      (item) => !excludedIds.includes(item.id)
    )

    similarArticles = [...similarArticles, ...fallbackMatches].slice(0, 3)
  }

  const topicIds = [
    ...new Set(
      [article.topic_id, ...similarArticles.map((item) => item.topic_id)].filter(Boolean)
    ),
  ]

  let topicNamesById = {}

  if (topicIds.length > 0) {
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name')
      .in('id', topicIds)

    topicNamesById = Object.fromEntries(
      (topics || []).map((topic) => [topic.id, topic.name])
    )
  }

  const enrichedSimilarArticles = similarArticles.map((item) => ({
    ...item,
    topic_name: topicNamesById[item.topic_id] || '',
  }))

  const visibleTags = (Array.isArray(article.tags) ? article.tags : [])
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag) => !INTERNAL_TAGS.includes(tag))

  const articleUrl = `/article/${article.slug}`
  const relatedSectionTitle =
    article.content_type === 'video' ? 'شاهد أيضاً' : 'أقرأ أيضاً'

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

            <article className="article-full">
              <div className="article-detail-topbar">
                <div className="article-meta article-detail-dates">
                  <span>{formatHijriDate(article.created_at)}</span>
                  <span className="article-detail-date-separator">-</span>
                  <span>{formatGregorianDate(article.created_at)}</span>
                </div>

                <div className="article-detail-favorite">
                  <FavoritePillButton articleId={article.id} />
                  <PrintButton />
                  <ShareMenuButton
                    title={article.title}
                    summary={article.summary}
                    url={articleUrl}
                  />
                </div>
              </div>

              <hr className="article-divider" />

              <h1>{article.title}</h1>

              <div className="article-content" dir="rtl">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </article>

            {visibleTags.length > 0 && (
              <section className="article-page-tags-section">
                <div className="article-page-tags">
                  {visibleTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="article-page-tag-btn"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {enrichedSimilarArticles.length > 0 && (
              <section className="article-related-section">
                <h2 className="article-related-title">{relatedSectionTitle}</h2>
                <div className="article-related-grid">
                  {enrichedSimilarArticles.map((relatedArticle) => (
                    <ArticleCard
                      key={relatedArticle.id}
                      article={relatedArticle}
                      compact
                      showTopic={false}
                      showTags={false}
                      showActions={false}
                      showFooter={false}
                      className="related-article-card"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
