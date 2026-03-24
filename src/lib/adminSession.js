import { createHmac, timingSafeEqual } from 'crypto'

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

function signValue(value) {
  return createHmac('sha256', getAdminSessionSecret())
    .update(value)
    .digest('base64url')
}

export function createAdminSessionValue(email) {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  })
  const encoded = Buffer.from(payload).toString('base64url')
  const signature = signValue(encoded)
  return `${encoded}.${signature}`
}

export function verifyAdminSessionValue(value) {
  if (!value || !value.includes('.')) return false

  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) return false

  const expected = signValue(encoded)
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
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
