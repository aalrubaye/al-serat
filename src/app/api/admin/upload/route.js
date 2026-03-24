import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

async function ensureBucketExists(bucket) {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

  if (listError) {
    throw new Error(listError.message)
  }

  const hasBucket = Array.isArray(buckets) && buckets.some((item) => item.name === bucket)

  if (hasBucket) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: '10MB',
  })

  if (createError && !String(createError.message || '').includes('already exists')) {
    throw new Error(createError.message)
  }
}

function getSafeExtension(file) {
  const mime = String(file?.type || 'image/jpeg')

  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('svg')) return 'svg'
  return 'jpg'
}

function sanitizeFolder(folder) {
  return String(folder || 'content')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '') || 'content'
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const bucket = String(formData.get('bucket') || 'article-media')
    const folder = sanitizeFolder(formData.get('folder'))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'لم يتم استلام ملف صالح' }, { status: 400 })
    }

    await ensureBucketExists(bucket)

    const extension = getSafeExtension(file)
    const path = `${folder}/${Date.now()}-${randomUUID()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
      path,
      bucket,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'تعذر رفع الصورة' },
      { status: 500 }
    )
  }
}
