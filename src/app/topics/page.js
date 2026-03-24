import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PublicBackButton from '../../components/PublicBackButton'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

function getCountLabel(count, singular, plural) {
  return count === 1 || count === 0 ? singular : plural
}

export default async function TopicsPage() {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .order('name', { ascending: true })

  const { data: articles } = await supabase
    .from('articles')
    .select('topic_id, content_type, title, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const topicStats = (articles || []).reduce((acc, article) => {
    const topicId = article.topic_id
    if (!topicId) return acc
    const current = acc[topicId] || {
      total: 0,
      article: 0,
      video: 0,
      titles: [],
    }
    current.total += 1

    if (article.content_type === 'video') {
      current.video += 1
    } else {
      current.article += 1
    }

    if (article.title && current.titles.length < 4) {
      current.titles.push(article.title)
    }

    acc[topicId] = current
    return acc
  }, {})

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
              <h1 className="page-title">الأقسام</h1>
            </div>

            <div className="topics-list">
              {(topics || []).map((topic) => {
                const stats = topicStats[topic.id] || {
                  total: 0,
                  article: 0,
                  video: 0,
                  titles: [],
                }

                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.id}`}
                    className="topic-item"
                  >
                    <div className="topic-item-head">
                      <span className="topic-item-name">{topic.name}</span>
                      <span className="topic-count-pill topic-item-count">
                        {formatArabicNumber(stats.total)} منشور
                      </span>
                    </div>

                    <p className="topic-item-meta">
                      ({formatArabicNumber(stats.article)}) {getCountLabel(stats.article, 'مقال', 'مقالات')} و ({formatArabicNumber(stats.video)}) {getCountLabel(stats.video, 'فيديو', 'فيديوهات')}
                    </p>

                    {stats.titles.length > 0 && (
                      <div className="topic-item-posts-wrap" aria-hidden="true">
                        <div className="topic-item-posts-divider" />

                        <ul className="topic-item-posts">
                          {stats.titles.slice(0, 3).map((title) => (
                            <li key={title}>{title}</li>
                          ))}
                        </ul>

                        {stats.total > 3 && (
                          <p className="topic-item-posts-more">
                            بالإضافة إلى منشورات أخرى
                          </p>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
