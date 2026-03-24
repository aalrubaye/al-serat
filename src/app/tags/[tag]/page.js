import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import ArticleCard from '../../../components/ArticleCard'
import PublicBackButton from '../../../components/PublicBackButton'

export const dynamic = 'force-dynamic'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

function formatPostCountBadge(count) {
  return `${formatArabicNumber(count)} منشور`
}

function formatResultsLine(count, query) {
  if (count === 0) {
    return 'لا توجد نتائج مطابقة. حاول مع كلمة أو عبارة أخرى.'
  }

  if (count === 1) {
    return `نتيجة واحدة عن "${query}".`
  }

  return `(${formatArabicNumber(count)}) نتائج عن "${query}"`
}

export default async function TagDetailsPage({ params }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const { data: topics } = await supabaseAdmin
    .from('topics')
    .select('id, name')

  const topicMap = Object.fromEntries(
    (topics || []).map((topic) => [topic.id, topic.name])
  )

  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, summary, content, created_at, topic_id, image, status, tags, content_type')
    .eq('status', 'published')
    .contains('tags', [decodedTag])
    .order('created_at', { ascending: false })

  const enriched = (articles || []).map((article) => ({
    ...article,
    topic_name: topicMap[article.topic_id] || '',
  }))

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
                <h1 className="page-title">الوسم: {decodedTag}</h1>
                <span className="topic-count-pill">
                  {formatPostCountBadge(enriched.length)}
                </span>
              </div>
              <p className="topic-page-count">
                {formatResultsLine(enriched.length, decodedTag)}
              </p>
            </div>

            {enriched.length ? (
              <div className="secondary-cards-grid">
                {enriched.map((article) => (
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
