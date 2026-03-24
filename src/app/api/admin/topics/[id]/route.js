import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  const { id } = await params
  const body = await request.json()

  const { error } = await supabaseAdmin
    .from('topics')
    .update({ name: body.name })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  // 🔒 Check if topic has linked articles
  const { count, error: countError } = await supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if (count > 0) {
    return NextResponse.json(
      { error: 'لا يمكن حذف الموضوع لأنه مرتبط بمقالات' },
      { status: 400 }
    )
  }

  // ✅ Safe to delete
  const { error } = await supabaseAdmin
    .from('topics')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}