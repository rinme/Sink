import { SITE_TOKEN_USER_ID, hashToken } from '../../utils/auth'
import { nanoid } from '@@/schemas/link'

/**
 * POST /api/admin/bootstrap
 * Creates the first real admin user and issues an initial token.
 * This endpoint only works when NO real users exist in the database yet
 * (the virtual site-token user does not count).
 * Protected by NUXT_SITE_TOKEN for the initial setup only.
 */
export default eventHandler(async (event) => {
  const { siteToken } = useRuntimeConfig(event)
  const rawToken = getHeader(event, 'Authorization')?.replace(/^Bearer\s+/i, '')

  if (!rawToken || rawToken !== siteToken) {
    throw createError({ status: 401, statusText: 'Provide the NUXT_SITE_TOKEN to bootstrap' })
  }

  const { DB } = event.context.cloudflare.env

  // Only allow if no real users exist (virtual site-token user doesn't count)
  const existing = await DB.prepare(
    `SELECT COUNT(*) as cnt FROM users WHERE id != ?`,
  ).bind(SITE_TOKEN_USER_ID).first<{ cnt: number }>()
  if (existing && existing.cnt > 0) {
    throw createError({ status: 409, statusText: 'Admin user already exists. Use /api/admin/tokens to create more.' })
  }

  const now = Math.floor(Date.now() / 1000)
  const userId = nanoid(10)()
  const tokenId = nanoid(10)()

  // Generate a secure random token
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const newToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const tokenHash = await hashToken(newToken)

  await DB.batch([
    DB.prepare(`INSERT INTO users (id, role, created_at) VALUES (?, 'admin', ?)`)
      .bind(userId, now),
    DB.prepare(
      `INSERT INTO api_tokens (id, user_id, token_hash, label, created_at)
       VALUES (?, ?, ?, 'Initial admin token', ?)`,
    ).bind(tokenId, userId, tokenHash, now),
  ])

  return {
    message: 'Admin user created. Store the token securely — it will not be shown again.',
    userId,
    token: newToken,
  }
})
