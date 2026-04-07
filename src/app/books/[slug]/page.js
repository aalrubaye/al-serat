import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import PublicBackButton from '../../../components/PublicBackButton'
import { getAllBooks, getBookBySlug } from '../../../lib/books'
import Link from 'next/link'
import BookFavoriteButton from '../../../components/BookFavoriteButton'
import PrintButton from '../../../components/PrintButton'
import ShareMenuButton from '../../../components/ShareMenuButton'
import BookSuggestions from '../../../components/BookSuggestions'

export const dynamic = 'force-static'

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

              {books.length > 1 && (
                <>
                  <div className="topic-page-divider book-detail-divider" />
                  <BookSuggestions books={books} currentSlug={book.slug} />
                </>
              )}
            </article>
          </div>
        </main>
      </div>
    </div>
  )
}
