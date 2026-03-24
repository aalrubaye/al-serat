import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import ArticleCard from '../../../components/ArticleCard'
import PublicBackButton from '../../../components/PublicBackButton'

export const dynamic = 'force-dynamic'

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

            <div className="topic-page-header">
              <h1 className="page-title">الوسم: {decodedTag}</h1>
              <p className="topic-page-count">{enriched.length} عنصر</p>
            </div>

            {enriched.length ? (
              <div className="secondary-cards-grid">
                {enriched.map((article) => (
                  <ArticleCard key={article.id} article={article} compact />
                ))}
              </div>
            ) : (
              <p>لا توجد مقالات مرتبطة بهذا الوسم</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
