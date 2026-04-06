import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import PublicBackButton from '../../../components/PublicBackButton'
import { getAllBooks, getBookBySlug } from '../../../lib/books'
import Link from 'next/link'
import BookFavoriteButton from '../../../components/BookFavoriteButton'
import PrintButton from '../../../components/PrintButton'
import ShareMenuButton from '../../../components/ShareMenuButton'

export const dynamic = 'force-static'

function getSuggestedBooks(books, currentBook, limit = 2) {
  const candidates = books.filter((candidate) => candidate.slug !== currentBook.slug)

  if (candidates.length <= limit) {
    return candidates
  }

  const seed = Array.from(currentBook.slug).reduce(
    (total, char, index) => total + char.charCodeAt(0) * (index + 1),
    0
  )

  const ranked = [...candidates].sort((left, right) => {
    const leftScore = (left.number * 97 + seed) % 997
    const rightScore = (right.number * 97 + seed) % 997
    return leftScore - rightScore
  })

  return ranked.slice(0, limit)
}

export async function generateStaticParams() {
  const books = await getAllBooks()
  return books.map((book) => ({ slug: book.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const book = await getBookBySlug(slug)

  if (!book) {
    return {
      title: 'الكتاب غير موجود | الصراط',
    }
  }

  return {
    title: `${book.title} | المكتبة | الصراط`,
    description: book.executiveSummary || 'ملخص كتاب من مكتبة الصراط',
  }
}

export default async function BookDetailPage({ params }) {
  const { slug } = await params
  const books = await getAllBooks()
  const book = books.find((item) => item.slug === slug) || null

  if (!book) {
    return (
      <div>
        <Header />
        <div className="layout">
          <Sidebar />

          <main className="main">
            <div className="home-content-wrap">
              <div className="page-top-actions">
                <PublicBackButton fallbackHref="/books" />
              </div>

              <div className="topic-page-header">
                <h1 className="page-title">الكتاب غير موجود</h1>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const suggestedBooks = getSuggestedBooks(books, book)

  return (
    <div>
      <Header />

      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap books-page-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/books" />
            </div>

            <article className="book-detail-card">
              <div className="book-detail-hero">
                <div className="book-detail-cover-shell">
                  <img
                    src={book.coverSrc}
                    alt={`غلاف كتاب ${book.title}`}
                    className="book-detail-cover"
                  />
                </div>

                <div className="book-detail-intro">
                  <div className="book-detail-favorite">
                    <ShareMenuButton
                      title={book.title}
                      summary={book.executiveSummary}
                      url={`/books/${book.slug}`}
                    />
                    <PrintButton />
                    <BookFavoriteButton bookSlug={book.slug} />
                  </div>

                  <h1 className="page-title book-detail-title">{book.title}</h1>

                  <div className="book-detail-download-card">
                    <div className="book-detail-download-copy">
                      <p className="book-detail-download-label">حجم الملف</p>
                      {(book.fileFormat || book.fileSizeLabel) && (
                        <p className="book-detail-file-meta">
                          {[book.fileFormat, book.fileSizeLabel].filter(Boolean).join('  •  ')}
                        </p>
                      )}
                    </div>

                    <div className="book-detail-actions">
                      <a
                        href={book.pdfSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="book-card-secondary-action"
                      >
                        قراءة الكتاب
                      </a>

                      <a
                        href={book.pdfSrc}
                        download={`${book.title} - موقع الصراط - al-serat.com.pdf`}
                        className="book-card-primary-action"
                      >
                        تحميل الكتاب
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="topic-page-divider book-detail-divider" />

              <section className="book-detail-summary-section">
                <div className="book-detail-long-summary">
                  {book.longSummary
                    .split(/\n\s*\n/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
              </section>

              {suggestedBooks.length > 0 && (
                <>
                  <div className="topic-page-divider book-detail-divider" />

                  <section className="book-suggestions-section" aria-label="كتب مقترحة">
                    <div className="topic-page-header topic-page-header-stacked book-suggestions-header">
                      <h2 className="page-title book-suggestions-title">اقرأ أيضاً</h2>
                    </div>

                    <div className="book-suggestions-grid">
                      {suggestedBooks.map((suggestedBook) => (
                        <article key={suggestedBook.slug} className="book-suggestion-card">
                          <Link
                            href={`/books/${suggestedBook.slug}`}
                            className="book-suggestion-cover-link"
                          >
                            <img
                              src={suggestedBook.coverSrc}
                              alt={`غلاف كتاب ${suggestedBook.title}`}
                              className="book-suggestion-cover"
                            />
                          </Link>

                          <div className="book-suggestion-copy">
                            <h3 className="book-suggestion-title">{suggestedBook.title}</h3>
                            <p className="book-suggestion-summary">
                              {suggestedBook.executiveSummary}
                            </p>

                            <div className="book-detail-actions book-suggestion-actions">
                              <Link
                                href={`/books/${suggestedBook.slug}`}
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
                </>
              )}
            </article>
          </div>
        </main>
      </div>
    </div>
  )
}
