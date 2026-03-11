import { z } from 'zod'
import { hashToken, requireAdmin } from '../../utils/auth'
import { nanoid } from '@@/schemas/link'

const CreateTokenSchema = z.object({
  userId: z.string().trim().min(1),
  label: z.string().trim().max(100).optional(),
})

/**
 * POST /api/admin/tokens
 * Create a new API token for any user. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const body = await readValidatedBody(event, CreateTokenSchema.parse)
  const { DB } = event.context.cloudflare.env

  // Verify user exists
  const user = await DB.prepare(`SELECT id FROM users WHERE id = ? LIMIT 1`).bind(body.userId).first()
  if (!user) {
    throw createError({ status: 404, statusText: 'User not found' })
  }

  const now = Math.floor(Date.now() / 1000)
  const tokenId = nanoid(10)()

  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const newToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const tokenHash = await hashToken(newToken)

  await DB.prepare(
    `INSERT INTO api_tokens (id, user_id, token_hash, label, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(tokenId, body.userId, tokenHash, body.label ?? 'API token', now).run()

  return {
    message: 'Token created. Store it securely — it will not be shown again.',
    tokenId,
    userId: body.userId,
    token: newToken,
  }
})
