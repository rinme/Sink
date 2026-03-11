import { z } from 'zod'
import { requireAdmin } from '../../utils/auth'

const RevokeTokenSchema = z.object({
  tokenId: z.string().trim().min(1),
})

/**
 * DELETE /api/admin/tokens
 * Revoke an API token. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const { tokenId } = await readValidatedBody(event, RevokeTokenSchema.parse)
  const { DB } = event.context.cloudflare.env

  const now = Math.floor(Date.now() / 1000)
  const result = await DB.prepare(
    `UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL`,
  ).bind(now, tokenId).run()

  if ((result.meta?.changes ?? 0) === 0) {
    throw createError({ status: 404, statusText: 'Token not found or already revoked' })
  }

  setResponseStatus(event, 204)
})
