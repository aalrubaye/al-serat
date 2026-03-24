import { supabase } from '../../../lib/supabase'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import LoadMoreArticleGrid from '../../../components/LoadMoreArticleGrid'
import PublicBackButton from '../../../components/PublicBackButton'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

export default async function TopicDetails({ params }) {
  const { id } = await params

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!topic) {
    return (
      <div>
        <Header />
        <div className="layout">
          <Sidebar />
          <main className="main">
            <h2>الموضوع غير موجود</h2>
          </main>
        </div>
      </div>
    )
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('topic_id', topic.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const enriched = (articles || []).map((article) => ({
    ...article,
    topic_name: topic.name,
  }))

  return (
    <div>
      <Header />
      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/topics" />
            </div>

            <div className="topic-page-header">
              <div className="page-title-with-pill">
                <h1 className="page-title">{topic.name}</h1>
                <span className="topic-count-pill">
                  {formatArabicNumber(enriched.length)} منشور
                </span>
              </div>
            </div>

            <div className="topic-page-divider" aria-hidden="true" />

            {enriched.length ? (
              <LoadMoreArticleGrid
                articles={enriched}
                initialCount={10}
                step={10}
              />
            ) : (
              <p>لا توجد عناصر مرتبطة بهذا الموضوع</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
