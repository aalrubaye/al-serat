import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { getAllBooks } from '../../../lib/books'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id) => String(id || '').trim()).filter(Boolean)
      : []
    const bookSlugs = Array.isArray(body?.bookSlugs)
      ? body.bookSlugs.map((slug) => String(slug || '').trim()).filter(Boolean)
      : []

    if (!ids.length && !bookSlugs.length) {
      return NextResponse.json({ articles: [], books: [] })
    }

    const [{ data: topics, error: topicsError }, { data: articles, error: articlesError }, allBooks] =
      await Promise.all([
        supabaseAdmin.from('topics').select('id, name'),
        supabaseAdmin
          .from('articles')
          .select('id, title, slug, summary, content, created_at, topic_id, image, content_type, status, tags')
          .in('id', ids)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
        bookSlugs.length ? getAllBooks() : Promise.resolve([]),
      ])

    if (topicsError || articlesError) {
      return NextResponse.json(
        {
          error: topicsError?.message || articlesError?.message || 'Failed to load bookmarks',
        },
        { status: 500 }
      )
    }

    const topicMap = Object.fromEntries(
      (topics || []).map((topic) => [topic.id, topic.name])
    )

    const enriched = (articles || []).map((article) => ({
      ...article,
      topic_name: topicMap[article.topic_id] || '',
    }))

    const books = (allBooks || []).filter((book) => bookSlugs.includes(book.slug))

    const orderedBooks = bookSlugs
      .map((slug) => books.find((book) => book.slug === slug))
      .filter(Boolean)

    return NextResponse.json({ articles: enriched, books: orderedBooks })
  } catch {
    return NextResponse.json(
      { error: 'Invalid bookmarks request' },
      { status: 400 }
    )
  }
}
