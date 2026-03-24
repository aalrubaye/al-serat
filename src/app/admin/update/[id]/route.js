import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

const FEATURED_TAG = '__featured__'

function normalizeUserTags(tags) {
  if (!Array.isArray(tags)) return []

  return tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag) => tag !== FEATURED_TAG)
}

export async function POST(req, context) {
  const { id } = await context.params
  const body = await req.json()

  if (body.featured !== undefined) {
    const shouldBeFeatured = Boolean(body.featured)

    if (shouldBeFeatured) {
      const { data: featuredArticles, error: featuredLoadError } = await supabaseAdmin
        .from('articles')
        .select('id, tags')
        .contains('tags', [FEATURED_TAG])

      if (featuredLoadError) {
        return NextResponse.json({ error: featuredLoadError.message }, { status: 500 })
      }

      for (const article of featuredArticles || []) {
        const cleanedTags = Array.isArray(article.tags)
          ? article.tags.filter((tag) => tag !== FEATURED_TAG)
          : []

        const { error: clearError } = await supabaseAdmin
          .from('articles')
          .update({ tags: cleanedTags })
          .eq('id', article.id)

        if (clearError) {
          return NextResponse.json({ error: clearError.message }, { status: 500 })
        }
      }
    }

    const { data: currentArticle, error: currentLoadError } = await supabaseAdmin
      .from('articles')
      .select('tags')
      .eq('id', id)
      .maybeSingle()

    if (currentLoadError) {
      return NextResponse.json({ error: currentLoadError.message }, { status: 500 })
    }

    const cleanTags = normalizeUserTags(currentArticle?.tags)
    const nextTags = shouldBeFeatured ? [...cleanTags, FEATURED_TAG] : cleanTags

    const { error } = await supabaseAdmin
      .from('articles')
      .update({ tags: nextTags })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  const payload = {}

  if (body.title !== undefined) payload.title = body.title
  if (body.slug !== undefined) payload.slug = body.slug
  if (body.summary !== undefined) payload.summary = body.summary
  if (body.image !== undefined) payload.image = body.image || null
  if (body.content !== undefined) payload.content = body.content
  if (body.topic_id !== undefined) payload.topic_id = body.topic_id

  if (body.tags !== undefined) {
    const cleanTags = normalizeUserTags(body.tags)

    const { data: currentArticle, error: currentLoadError } = await supabaseAdmin
      .from('articles')
      .select('tags')
      .eq('id', id)
      .maybeSingle()

    if (currentLoadError) {
      return NextResponse.json({ error: currentLoadError.message }, { status: 500 })
    }

    const hasFeaturedTag =
      Array.isArray(currentArticle?.tags) && currentArticle.tags.includes(FEATURED_TAG)

    payload.tags = hasFeaturedTag ? [...cleanTags, FEATURED_TAG] : cleanTags
  }

  if (body.status !== undefined) payload.status = body.status
  if (body.contentType !== undefined) payload.content_type = body.contentType

  const { error } = await supabaseAdmin
    .from('articles')
    .update(payload)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
