import { z } from 'zod'
import { requireAdmin } from '../../utils/auth'

const UnbanSlugSchema = z.object({
  slug: z.string().trim().min(1).max(2048),
})

/**
 * DELETE /api/admin/banned-slugs
 * Remove a slug from the banned list. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const { slug } = await readValidatedBody(event, UnbanSlugSchema.parse)
  const { DB } = event.context.cloudflare.env

  const result = await DB.prepare(
    `DELETE FROM banned_slugs WHERE slug = ?`,
  ).bind(slug).run()

  if ((result.meta?.changes ?? 0) === 0) {
    throw createError({ status: 404, statusText: 'Banned slug not found' })
  }

  setResponseStatus(event, 204)
})
