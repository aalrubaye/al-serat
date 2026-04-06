import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PublicBackButton from '../../components/PublicBackButton'
import { getAllBooks } from '../../lib/books'
import Link from 'next/link'

export const metadata = {
  title: 'المكتبة | الصراط',
}

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

export default async function BooksPage() {
  const books = await getAllBooks()

  return (
    <div>
      <Header />

      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap books-page-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/" />
            </div>

            <div className="topic-page-header topic-page-header-stacked">
              <div className="page-title-with-pill">
                <h1 className="page-title">المكتبة</h1>
                <span className="topic-count-pill">
                  {formatArabicNumber(books.length)} كتاب
                </span>
              </div>
            </div>

            <section className="books-grid" aria-label="قائمة الكتب">
              {books.map((book) => (
                <article key={book.slug} className="book-card">
                  <Link href={`/books/${book.slug}`} className="book-card-cover-link">
                    <div className="book-card-cover-frame">
                      <img
                        src={book.coverSrc}
                        alt={`غلاف كتاب ${book.title}`}
                        className="book-card-cover"
                      />
                    </div>
                  </Link>

                  <div className="book-card-body">
                    <div className="book-card-copy">
                      <h2 className="book-card-title">
                        {book.title}
                      </h2>

                      <p className="book-card-summary">
                        {book.executiveSummary}
                      </p>
                    </div>

                    <div className="book-card-actions">
                      <Link href={`/books/${book.slug}`} className="book-card-secondary-action">
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
