import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

const FEATURED_TAG = '__featured__'

function normalizeUserTagsFromInput(tagsInput) {
  if (!tagsInput) return []

  return tagsInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => tag !== FEATURED_TAG)
}

export async function POST(req) {
  const body = await req.json()

  const payload = {
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    image: body.image || null,
    content: body.content,
    topic_id: body.topicId || null,
    tags: normalizeUserTagsFromInput(body.tagsInput),
    status: body.status,
    content_type: body.contentType || 'article',
  }

  const { error } = await supabaseAdmin
    .from('articles')
    .insert(payload)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
