import { supabase } from '../../../lib/supabase'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import ArticleCard from '../../../components/ArticleCard'
import PublicBackButton from '../../../components/PublicBackButton'

function getTypeLabel(type) {
  return type === 'video' ? 'فيديو' : 'مقال'
}

export default async function TypeDetailsPage({ params }) {
  const { type } = await params
  const normalizedType = type === 'video' ? 'video' : 'article'

  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')

  const topicMap = Object.fromEntries(
    (topics || []).map((topic) => [topic.id, topic.name])
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, summary, content, created_at, topic_id, image, status, tags, content_type')
    .eq('status', 'published')
    .eq('content_type', normalizedType)
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
              <h1 className="page-title">النوع: {getTypeLabel(normalizedType)}</h1>
              <p className="topic-page-count">{enriched.length} عنصر</p>
            </div>

            {enriched.length ? (
              <div className="secondary-cards-grid">
                {enriched.map((article) => (
                  <ArticleCard key={article.id} article={article} compact />
                ))}
              </div>
            ) : (
              <p>لا توجد عناصر من هذا النوع</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
