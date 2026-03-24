import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id) => String(id || '').trim()).filter(Boolean)
      : []

    if (!ids.length) {
      return NextResponse.json({ articles: [] })
    }

    const [{ data: topics, error: topicsError }, { data: articles, error: articlesError }] =
      await Promise.all([
        supabaseAdmin.from('topics').select('id, name'),
        supabaseAdmin
          .from('articles')
          .select('id, title, slug, summary, content, created_at, topic_id, image, content_type, status, tags')
          .in('id', ids)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
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

    return NextResponse.json({ articles: enriched })
  } catch {
    return NextResponse.json(
      { error: 'Invalid bookmarks request' },
      { status: 400 }
    )
  }
}
