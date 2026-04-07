'use client'

import { useMemo } from 'react'
import Link from 'next/link'

function getRandomBooks(books, currentSlug, limit = 2) {
  const candidates = books.filter((book) => book.slug !== currentSlug)

  if (candidates.length <= limit) {
    return candidates
  }

  const shuffled = [...candidates]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled.slice(0, limit)
}

export default function BookSuggestions({ books, currentSlug }) {
  const suggestedBooks = useMemo(
    () => getRandomBooks(books || [], currentSlug, 2),
    [books, currentSlug]
  )

  if (suggestedBooks.length === 0) {
    return null
  }

  return (
    <section className="book-suggestions-section" aria-label="كتب مقترحة">
      <div className="topic-page-header topic-page-header-stacked book-suggestions-header">
        <h2 className="page-title book-suggestions-title">اقرأ أيضاً</h2>
      </div>

      <div className="book-suggestions-grid">
        {suggestedBooks.map((suggestedBook) => (
          <article key={suggestedBook.slug} className="book-suggestion-card">
            <Link href={`/books/${suggestedBook.slug}`} className="book-suggestion-cover-link">
              <img
                src={suggestedBook.coverSrc}
                alt={`غلاف كتاب ${suggestedBook.title}`}
                className="book-suggestion-cover"
              />
            </Link>

            <div className="book-suggestion-copy">
              <h3 className="book-suggestion-title">{suggestedBook.title}</h3>
              <p className="book-suggestion-summary">{suggestedBook.executiveSummary}</p>

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
  )
}
