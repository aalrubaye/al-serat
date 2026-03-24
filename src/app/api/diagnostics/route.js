import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }

  if (!env.hasSupabaseUrl || !env.hasServiceRoleKey) {
    return NextResponse.json({
      ok: false,
      env,
      message: 'Missing required Supabase environment variables on the server.',
    })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const [
      { count: publishedCount, error: publishedError },
      { count: totalCount, error: totalError },
      { count: topicCount, error: topicError },
      { data: latestArticles, error: latestError },
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('topics').select('*', { count: 'exact', head: true }),
      supabase
        .from('articles')
        .select('id, title, status, slug, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return NextResponse.json({
      ok: !publishedError && !totalError && !topicError && !latestError,
      env,
      counts: {
        publishedArticles: publishedCount ?? null,
        totalArticles: totalCount ?? null,
        topics: topicCount ?? null,
      },
      latestArticles: latestArticles || [],
      errors: {
        published: publishedError?.message || null,
        total: totalError?.message || null,
        topics: topicError?.message || null,
        latest: latestError?.message || null,
      },
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      env,
      message: error instanceof Error ? error.message : 'Unknown diagnostics error',
    })
  }
}
