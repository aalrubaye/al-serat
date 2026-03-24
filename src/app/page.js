import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import FeaturedCard from '../components/FeaturedCard'
import LoadMoreArticleGrid from '../components/LoadMoreArticleGrid'

export const dynamic = 'force-dynamic'

const FEATURED_TAG = '__featured__'
const HOME_FILTER_LIMIT = 10
const HOME_FETCH_LIMIT = 60

function normalizeHomeFilter(value) {
  return value === 'article' || value === 'video' ? value : 'all'
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams
  const activeFilter = normalizeHomeFilter(params?.type)

  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')

  const topicMap = Object.fromEntries((topics || []).map((topic) => [topic.id, topic.name]))

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, summary, content, created_at, topic_id, image, status, tags, content_type')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(HOME_FETCH_LIMIT)

  const enrichedArticles = (articles || []).map((article) => ({
    ...article,
    topic_name: topicMap[article.topic_id] || '',
  }))

  const filteredArticles =
    activeFilter === 'all'
      ? enrichedArticles
      : enrichedArticles.filter((article) => article.content_type === activeFilter)

  const selectedFeatured = filteredArticles.find(
    (article) => Array.isArray(article.tags) && article.tags.includes(FEATURED_TAG)
  )

  const latestArticles = filteredArticles.slice(0, HOME_FILTER_LIMIT)
  const latestArticleIds = new Set(latestArticles.map((article) => article.id))
  const featured =
    selectedFeatured ||
    latestArticles[0] ||
    filteredArticles[0]

  const featuredIsInLatest = featured ? latestArticleIds.has(featured.id) : false
  const visibleArticles = featured
    ? featuredIsInLatest
      ? latestArticles
      : [featured, ...latestArticles.slice(0, HOME_FILTER_LIMIT - 1)]
    : latestArticles
  const rest = visibleArticles.filter((article) => article.id !== featured?.id)
  const remainingArticles = filteredArticles.filter(
    (article) => !visibleArticles.some((visibleArticle) => visibleArticle.id === article.id)
  )
  const loadMoreArticles = [...rest, ...remainingArticles]
  const initialRestCount = rest.length

  return (
    <div>
      <Header />
      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap">
            {featured && <FeaturedCard article={featured} />}

            {loadMoreArticles.length > 0 ? (
              <LoadMoreArticleGrid
                articles={loadMoreArticles}
                initialCount={initialRestCount}
                step={10}
              />
            ) : (
              !featured && (
                <p>
                  {activeFilter === 'video'
                    ? 'لا توجد فيديوهات بعد'
                    : activeFilter === 'article'
                      ? 'لا توجد مقالات بعد'
                      : 'لا توجد إضافات بعد'}
                </p>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
