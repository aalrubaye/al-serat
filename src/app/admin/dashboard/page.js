import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import Link from 'next/link'
import DeleteArticleButton from '../../../components/DeleteArticleButton'
import PublishArticleButton from '../../../components/PublishArticleButton'
import FeatureArticleButton from '../../../components/FeatureArticleButton'
import AdminLogoutButton from '../../../components/AdminLogoutButton'

export const dynamic = 'force-dynamic'

const FEATURED_TAG = '__featured__'

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

function getStatusLabel(status) {
  return status === 'published' ? 'منشور' : 'مسودة'
}

function getStatusClass(status) {
  return status === 'published'
    ? 'admin-status-tag published'
    : 'admin-status-tag draft'
}

export default async function AdminDashboardPage() {
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, status, created_at, tags')
    .order('created_at', { ascending: false })

  return (
    <main className="admin-page">
      <div className="admin-card wide">
        <div className="admin-topbar">
          <h1>لوحة الإدارة</h1>

          <div className="admin-topbar-actions">
            <AdminLogoutButton />

            <Link href="/admin/topics" className="new-article-btn secondary">
              إدارة الأقسام
            </Link>

            <Link href="/admin/new" className="new-article-btn">
              إضافة مقال جديد
            </Link>
          </div>
        </div>

        {error ? (
          <p>حدث خطأ أثناء تحميل المقالات</p>
        ) : articles?.length ? (
          <div className="admin-articles-list">
            {articles.map((article) => {
              const isFeatured =
                Array.isArray(article.tags) && article.tags.includes(FEATURED_TAG)

              return (
                <div key={article.id} className="admin-article-row admin-article-row-highlight">
                  <div className="admin-article-main">
                    <h3>{article.title}</h3>

                    <div className="admin-article-meta">
                      <span className={getStatusClass(article.status)}>
                        {getStatusLabel(article.status)}
                      </span>

                      {isFeatured && (
                        <span className="admin-featured-tag">مقال مميز</span>
                      )}

                      <span className="admin-date-inline">
                        {formatHijriDate(article.created_at)}
                      </span>

                      <span className="admin-date-separator">•</span>

                      <span className="admin-date-inline">
                        {formatGregorianDate(article.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="admin-actions">
                    {article.status === 'published' && !isFeatured && (
                      <FeatureArticleButton articleId={article.id} isFeatured={isFeatured} />
                    )}

                    {article.status !== 'published' && (
                      <PublishArticleButton articleId={article.id} />
                    )}

                    <Link
                      href={`/admin/edit/${article.id}`}
                      className="admin-action-btn admin-update-btn"
                    >
                      تعديل
                    </Link>

                    <DeleteArticleButton articleId={article.id} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p>لا توجد مقالات بعد</p>
        )}
      </div>
    </main>
  )
}
