import { z } from 'zod'
import { requireAdmin } from '../../utils/auth'

const BanSlugSchema = z.object({
  slug: z.string().trim().min(1).max(2048),
  reason: z.string().trim().max(500).optional(),
})

/**
 * POST /api/admin/banned-slugs
 * Add a slug to the banned list. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const user = event.context.user
  const body = await readValidatedBody(event, BanSlugSchema.parse)
  const { DB } = event.context.cloudflare.env

  const now = Math.floor(Date.now() / 1000)

  try {
    await DB.prepare(
      `INSERT INTO banned_slugs (slug, reason, created_by, created_at) VALUES (?, ?, ?, ?)`,
    ).bind(body.slug, body.reason ?? null, user.id, now).run()
  }
  catch {
    throw createError({ status: 409, statusText: 'Slug is already banned' })
  }

  setResponseStatus(event, 201)
  return { slug: body.slug, reason: body.reason }
})
