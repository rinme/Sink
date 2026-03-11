import { requireAdmin } from '../../utils/auth'

/**
 * GET /api/admin/users
 * List all users. Admin only.
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const { DB } = event.context.cloudflare.env

  const result = await DB.prepare(
    `SELECT u.id, u.role, u.created_at as createdAt,
       COUNT(t.id) as tokenCount,
       COUNT(l.slug) as linkCount
     FROM users u
     LEFT JOIN api_tokens t ON t.user_id = u.id AND t.revoked_at IS NULL
     LEFT JOIN links l ON l.owner_user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  ).all<{ id: string, role: string, createdAt: number, tokenCount: number, linkCount: number }>()

  return { users: result.results ?? [] }
})
