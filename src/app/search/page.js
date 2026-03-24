import { supabaseAdmin } from '../../lib/supabaseAdmin'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ArticleCard from '../../components/ArticleCard'
import PublicBackButton from '../../components/PublicBackButton'

export const dynamic = 'force-dynamic'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

function formatPostCountBadge(count) {
  return `${formatArabicNumber(count)} منشور`
}

function formatResultsLine(count, query) {
  if (!query) {
    return 'اكتب كلمة أو عبارة للبحث'
  }

  if (count === 0) {
    return 'لا توجد نتائج مطابقة. حاول مع كلمة أو عبارة أخرى.'
  }

  if (count === 1) {
    return `نتيجة واحدة عن "${query}".`
  }

  return `(${formatArabicNumber(count)}) نتائج عن "${query}"`
}

function normalizeSearchText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ar')
}

function getQueryTerms(query) {
  return normalizeSearchText(query)
    .split(' ')
    .map((term) => term.trim())
    .filter(Boolean)
}

function buildSearchableArticle(article) {
  const title = normalizeSearchText(article.title)
  const summary = normalizeSearchText(article.summary)
  const content = normalizeSearchText(article.content)
  const topic = normalizeSearchText(article.topic_name)
  const type = normalizeSearchText(
    article.content_type === 'video' ? 'فيديو' : 'مقال'
  )
  const tags = (Array.isArray(article.tags) ? article.tags : [])
    .map((tag) => normalizeSearchText(tag))
    .filter(Boolean)

  return {
    title,
    summary,
    content,
    topic,
    type,
    tags,
    combined: [title, summary, content, topic, type, ...tags]
      .filter(Boolean)
      .join(' '),
  }
}

function getArticleSearchScore(article, query) {
  const normalizedQuery = normalizeSearchText(query)
  const terms = getQueryTerms(query)

  if (!normalizedQuery || !terms.length) return 0

  const searchable = buildSearchableArticle(article)

  if (!terms.every((term) => searchable.combined.includes(term))) {
    return -1
  }

  let score = 0

  if (searchable.title.includes(normalizedQuery)) score += 140
  if (searchable.summary.includes(normalizedQuery)) score += 90
  if (searchable.topic.includes(normalizedQuery)) score += 80
  if (searchable.tags.some((tag) => tag.includes(normalizedQuery))) score += 85
  if (searchable.content.includes(normalizedQuery)) score += 40

  for (const term of terms) {
    if (searchable.title.includes(term)) score += 28
    if (searchable.summary.includes(term)) score += 18
    if (searchable.topic.includes(term)) score += 16
    if (searchable.tags.some((tag) => tag.includes(term))) score += 16
    if (searchable.content.includes(term)) score += 8
  }

  if (terms.length > 1 && searchable.title.includes(terms.join(' '))) {
    score += 36
  }

  return score
}

export default async function SearchPage({ searchParams }) {
  const { q = '' } = await searchParams
  const query = String(q || '').trim()

  const { data: topics } = await supabaseAdmin
    .from('topics')
    .select('id, name')

  const topicMap = Object.fromEntries(
    (topics || []).map((topic) => [topic.id, topic.name])
  )

  const { data: publishedArticles } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, summary, content, created_at, topic_id, image, status, tags, content_type')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(200)

  const enrichedArticles = (publishedArticles || []).map((article) => ({
    ...article,
    topic_name: topicMap[article.topic_id] || '',
  }))

  const searchResults = query
    ? enrichedArticles
        .map((article) => ({
          article,
          score: getArticleSearchScore(article, query),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return new Date(b.article.created_at) - new Date(a.article.created_at)
        })
        .map((entry) => entry.article)
    : []

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

            <div className="topic-page-header topic-page-header-stacked">
              <div className="page-title-with-pill">
                <h1 className="page-title">البحث</h1>
                <span className="topic-count-pill">
                  {formatPostCountBadge(searchResults.length)}
                </span>
              </div>
              <p className="topic-page-count">
                {formatResultsLine(searchResults.length, query)}
              </p>
            </div>

            {query && searchResults.length ? (
              <div className="secondary-cards-grid">
                {searchResults.map((article) => (
                  <ArticleCard key={article.id} article={article} compact />
                ))}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
