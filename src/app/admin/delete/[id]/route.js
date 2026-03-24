import { supabase } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request, context) {
  const { id } = await context.params

  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'لم يتم حذف أي مقال. غالباً توجد مشكلة في صلاحيات Supabase (RLS) أو الجلسة الحالية ليست admin' },
      { status: 403 }
    )
  }

  return NextResponse.json({ success: true, deletedId: id })
}