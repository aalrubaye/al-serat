'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import LoadMoreArticleGrid from '../../components/LoadMoreArticleGrid'
import PublicBackButton from '../../components/PublicBackButton'

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

export default function BookmarksPage() {
  const [articles, setArticles] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookmarks() {
      const ids = JSON.parse(localStorage.getItem('favorites') || '[]')
      const bookSlugs = JSON.parse(localStorage.getItem('bookFavorites') || '[]')

      if (!ids.length && !bookSlugs.length) {
        setArticles([])
        setBooks([])
        setLoading(false)
        return
      }

      const [articlesResponse, booksResponse] = await Promise.all([
        ids.length
          ? fetch('/api/bookmarks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids }),
            })
          : Promise.resolve(null),
        bookSlugs.length ? fetch('/books/manifest.json') : Promise.resolve(null),
      ])

      let nextArticles = []
      if (articlesResponse?.ok) {
        const payload = await articlesResponse.json()
        nextArticles = Array.isArray(payload.articles) ? payload.articles : []
      }

      let nextBooks = []
      if (booksResponse?.ok) {
        const manifest = await booksResponse.json()
        const booksBySlug = new Map(
          (Array.isArray(manifest) ? manifest : []).map((book) => [book.slug, book])
        )

        nextBooks = bookSlugs
          .map((slug) => booksBySlug.get(slug))
          .filter(Boolean)
      }

      setArticles(nextArticles)
      setBooks(nextBooks)
      setLoading(false)
    }

    loadBookmarks()
  }, [])

  const totalCount = articles.length + books.length

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
              <div className="page-title-with-pill">
                <h1 className="page-title">المفضلة</h1>
                {!loading && totalCount > 0 && (
                  <span className="topic-count-pill">
                    {formatArabicNumber(totalCount)} عنصر
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <p>جاري التحميل...</p>
            ) : (
              <>
                {books.length > 0 && (
                  <section className="bookmarks-books-section" aria-label="الكتب المحفوظة">
                    <div className="topic-page-header topic-page-header-stacked book-suggestions-header">
                      <h2 className="page-title book-suggestions-title">الكتب</h2>
                    </div>

                    <div className="book-suggestions-grid">
                      {books.map((book) => (
                        <article key={book.slug} className="book-suggestion-card">
                          <Link href={`/books/${book.slug}`} className="book-suggestion-cover-link">
                            <img
                              src={book.coverSrc}
                              alt={`غلاف كتاب ${book.title}`}
                              className="book-suggestion-cover"
                            />
                          </Link>

                          <div className="book-suggestion-copy">
                            <h3 className="book-suggestion-title">{book.title}</h3>
                            <p className="book-suggestion-summary">{book.executiveSummary}</p>

                            <div className="book-detail-actions book-suggestion-actions">
                              <Link
                                href={`/books/${book.slug}`}
                                className="book-card-secondary-action"
                              >
                                عرض التفاصيل
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {articles.length > 0 && (
                  <section className="bookmarks-articles-section" aria-label="المنشورات المحفوظة">
                    {books.length > 0 && <div className="topic-page-divider book-detail-divider" />}
                    <div className="topic-page-header topic-page-header-stacked book-suggestions-header">
                      <h2 className="page-title book-suggestions-title">المنشورات</h2>
                    </div>

                    <LoadMoreArticleGrid
                      articles={articles}
                      initialCount={10}
                      step={10}
                    />
                  </section>
                )}

                {!books.length && !articles.length && (
                  <p>لا توجد عناصر في المفضلة</p>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
