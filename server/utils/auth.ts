import type { H3Event } from 'h3'

export interface AuthedUser {
  id: string
  role: 'user' | 'admin'
}

/**
 * Hash a raw token using SHA-256 for safe DB storage.
 */
export async function hashToken(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Well-known user ID for the NUXT_SITE_TOKEN virtual admin. */
export const SITE_TOKEN_USER_ID = '__sitetoken__'

/**
 * Validate a bearer token against D1 and return the authenticated user.
 * Falls back to accepting NUXT_SITE_TOKEN as a virtual admin (id=SITE_TOKEN_USER_ID)
 * for backward compatibility with existing deployments that haven't bootstrapped D1.
 * When using this fallback with D1 available, the virtual user is auto-created so
 * foreign-key constraints on the links table are satisfied.
 * Also updates the last_used_at timestamp asynchronously.
 */
export async function requireUser(event: H3Event): Promise<AuthedUser> {
  const raw = getHeader(event, 'Authorization')?.replace(/^Bearer\s+/i, '')
  if (!raw) {
    throw createError({ status: 401, statusText: 'Missing Authorization header' })
  }

  if (raw.length < 8) {
    throw createError({ status: 401, statusText: 'Token is too short' })
  }

  const { DB } = event.context.cloudflare.env
  const { siteToken } = useRuntimeConfig(event)

  // NUXT_SITE_TOKEN fallback: grants admin access for backward compat / initial bootstrap.
  if (raw === siteToken) {
    if (DB) {
      // Ensure the virtual site-token user exists in D1 so FK constraints are satisfied
      const now = Math.floor(Date.now() / 1000)
      await DB.prepare(
        `INSERT OR IGNORE INTO users (id, role, created_at) VALUES (?, 'admin', ?)`,
      ).bind(SITE_TOKEN_USER_ID, now).run()
    }
    return { id: SITE_TOKEN_USER_ID, role: 'admin' }
  }

  if (!DB) {
    throw createError({ status: 500, statusText: 'D1 database binding (DB) is not configured' })
  }

  const tokenHash = await hashToken(raw)

  const row = await DB.prepare(
    `SELECT t.id AS token_id, t.user_id, u.role
     FROM api_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.revoked_at IS NULL
     LIMIT 1`,
  ).bind(tokenHash).first<{ token_id: string, user_id: string, role: string }>()

  if (!row) {
    throw createError({ status: 401, statusText: 'Invalid or revoked token' })
  }

  // Update last_used_at without blocking the response
  const now = Math.floor(Date.now() / 1000)
  event.context.cloudflare.ctx.waitUntil(
    DB.prepare(`UPDATE api_tokens SET last_used_at = ? WHERE id = ?`)
      .bind(now, row.token_id)
      .run(),
  )

  return { id: row.user_id, role: (row.role ?? 'user') as AuthedUser['role'] }
}

/**
 * Assert current user is admin, throwing 403 otherwise.
 */
export function requireAdmin(event: H3Event): void {
  const user = event.context.user as AuthedUser | undefined
  if (!user || user.role !== 'admin') {
    throw createError({ status: 403, statusText: 'Admin access required' })
  }
}
