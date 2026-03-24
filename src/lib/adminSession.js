const ADMIN_COOKIE_NAME = 'al_serat_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'al-serat-admin-session'
  )
}

function toBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getAdminSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function signValue(value) {
  const key = await importSigningKey()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  )

  return toBase64Url(new Uint8Array(signature))
}

export async function createAdminSessionValue(email) {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  })
  const encoded = toBase64Url(payload)
  const signature = await signValue(encoded)
  return `${encoded}.${signature}`
}

export async function verifyAdminSessionValue(value) {
  if (!value || !value.includes('.')) return false

  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) return false

  try {
    const key = await importSigningKey()
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(encoded)
    )

    if (!isValid) return false

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded))
    )

    return Number(payload?.exp) > Date.now()
  } catch {
    return false
  }
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME
}

export function getAdminSessionMaxAge() {
  return SESSION_MAX_AGE
}
