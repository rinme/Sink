import { requireAdmin } from '../../utils/auth'
import { nanoid } from '@@/schemas/link'

interface KVLinkValue {
  id?: string
  url: string
  slug: string
  comment?: string
  createdAt?: number
  updatedAt?: number
  expiration?: number
  title?: string
  description?: string
  image?: string
  timer?: number
  nsfw?: boolean
}

/**
 * POST /api/admin/migrate-kv
 * Migrates links from Cloudflare KV storage to D1.
 * Assigns all migrated links to the calling admin user.
 * Admin only. Safe to run multiple times (skips existing slugs).
 */
export default eventHandler(async (event) => {
  requireAdmin(event)

  const user = event.context.user
  const { DB, KV } = event.context.cloudflare.env

  let migrated = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []
  let cursor: string | undefined

  do {
    const list = await KV.list({ prefix: 'link:', limit: 100, cursor })
    cursor = list.list_complete ? undefined : list.cursor

    for (const key of list.keys) {
      try {
        const raw = await KV.get(key.name, { type: 'json' }) as KVLinkValue | null
        if (!raw || !raw.url || !raw.slug) {
          skipped++
          continue
        }

        // Check if slug already exists in D1
        const existing = await DB.prepare(`SELECT slug FROM links WHERE slug = ? LIMIT 1`).bind(raw.slug).first()
        if (existing) {
          skipped++
          continue
        }

        const now = Math.floor(Date.now() / 1000)
        await DB.prepare(
          `INSERT INTO links (id, url, slug, owner_user_id, comment, created_at, updated_at, expiration, title, description, image, timer, nsfw)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          raw.id ?? nanoid(10)(),
          raw.url,
          raw.slug,
          user.id,
          raw.comment ?? null,
          raw.createdAt ?? now,
          raw.updatedAt ?? now,
          raw.expiration ?? null,
          raw.title ?? null,
          raw.description ?? null,
          raw.image ?? null,
          raw.timer ?? null,
          raw.nsfw ? 1 : 0,
        ).run()

        migrated++
      }
      catch (err) {
        failed++
        errors.push(`${key.name}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  } while (cursor)

  return {
    migrated,
    skipped,
    failed,
    errors: errors.slice(0, 20), // cap error list for readability
  }
})
