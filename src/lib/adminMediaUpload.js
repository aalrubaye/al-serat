const ADMIN_MEDIA_BUCKET = 'article-media'

function getFileExtension(fileOrMime) {
  const mime =
    typeof fileOrMime === 'string'
      ? fileOrMime
      : fileOrMime?.type || 'image/jpeg'

  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('svg')) return 'svg'
  return 'jpg'
}

function sanitizeFileName(name) {
  return String(name || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image'
}

export async function uploadAdminMediaFile(file, folder = 'content') {
  const signedResponse = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      folder,
      bucket: ADMIN_MEDIA_BUCKET,
    }),
  })

  const signedData = await signedResponse.json().catch(() => ({}))

  if (!signedResponse.ok || !signedData.token || !signedData.path) {
    throw new Error(signedData.error || 'تعذر تجهيز رفع الصورة')
  }

  const { supabase } = await import('./supabase')
  const { error: uploadError } = await supabase.storage
    .from(signedData.bucket || ADMIN_MEDIA_BUCKET)
    .uploadToSignedUrl(signedData.path, signedData.token, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'تعذر رفع الصورة')
  }

  if (!signedData.url) {
    throw new Error('تعذر الحصول على رابط الصورة')
  }

  return signedData.url
}

export function dataUrlToFile(dataUrl, name = 'image') {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)

  if (!match) return null

  const [, mime, base64] = match
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  const extension = getFileExtension(mime)
  const safeName = sanitizeFileName(name)

  return new File([bytes], `${safeName}.${extension}`, { type: mime })
}

export async function normalizeThumbnailImage(imageUrl) {
  if (!String(imageUrl || '').startsWith('data:image/')) {
    return imageUrl
  }

  const file = dataUrlToFile(imageUrl, 'thumbnail')
  if (!file) return imageUrl

  return uploadAdminMediaFile(file, 'thumbnails')
}

export async function normalizeEditorContentImages(html) {
  if (!String(html || '').includes('data:image/')) {
    return html
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')
  const images = Array.from(document.querySelectorAll('img[src^="data:image/"]'))

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index]
    const src = image.getAttribute('src') || ''
    const file = dataUrlToFile(src, `inline-image-${index + 1}`)

    if (!file) continue

    const uploadedUrl = await uploadAdminMediaFile(file, 'content')
    image.setAttribute('src', uploadedUrl)
  }

  return document.body.innerHTML
}
