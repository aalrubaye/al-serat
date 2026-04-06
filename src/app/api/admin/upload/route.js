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
    const body = await request.json()
    const bucket = String(body.bucket || 'article-media')
    const folder = sanitizeFolder(body.folder)
    const fileName = String(body.fileName || 'image')
    const contentType = String(body.contentType || 'image/jpeg')

    await ensureBucketExists(bucket)

    const extension = getSafeExtension(contentType)
    const safeBaseName = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'image'
    const path = `${folder}/${Date.now()}-${safeBaseName}-${randomUUID()}.${extension}`

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path, {
        upsert: false,
      })

    if (signedError || !signedData?.token) {
      return NextResponse.json(
        { error: signedError?.message || 'تعذر إنشاء رابط الرفع' },
        { status: 500 }
      )
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      token: signedData.token,
      url: data.publicUrl,
      path,
      bucket,
      contentType,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'تعذر رفع الصورة' },
      { status: 500 }
    )
  }
}
