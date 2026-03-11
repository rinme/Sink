import { z } from 'zod'
import { hashToken, requireAdmin } from '../../utils/auth'
import { nanoid } from '@@/schemas/link'

const CreateUserSchema = z.object({
  role: z.enum(['user', 'admin']).default('user'),
  label: z.string().trim().max(100).optional(),
})

/**
 * POST /api/admin/users
 * Create a new user and issue an initial token for them.
 * Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const body = await readValidatedBody(event, CreateUserSchema.parse)
  const { DB } = event.context.cloudflare.env

  const now = Math.floor(Date.now() / 1000)
  const userId = nanoid(10)()
  const tokenId = nanoid(10)()

  // Generate a secure random token
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const newToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const tokenHash = await hashToken(newToken)

  await DB.batch([
    DB.prepare(`INSERT INTO users (id, role, created_at) VALUES (?, ?, ?)`)
      .bind(userId, body.role, now),
    DB.prepare(
      `INSERT INTO api_tokens (id, user_id, token_hash, label, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(tokenId, userId, tokenHash, body.label ?? 'Initial token', now),
  ])

  return {
    message: 'User created. Store the token securely — it will not be shown again.',
    userId,
    role: body.role,
    token: newToken,
  }
})
