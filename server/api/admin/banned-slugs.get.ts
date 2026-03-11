import { requireAdmin } from '../../utils/auth'

/**
 * GET /api/admin/banned-slugs
 * List all banned/reserved slugs. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const { DB } = event.context.cloudflare.env
  const result = await DB.prepare(
    `SELECT slug, reason, created_by, created_at FROM banned_slugs ORDER BY created_at DESC`,
  ).all<{ slug: string, reason: string | null, created_by: string, created_at: number }>()

  return { bannedSlugs: result.results ?? [] }
})
