import type { LinkSchema } from '@@/schemas/link'
import type { H3Event } from 'h3'
import type { z } from 'zod'

type Link = z.infer<typeof LinkSchema>

/** Row shape returned from D1 links table */
interface LinkRow {
  id: string
  url: string
  slug: string
  owner_user_id: string
  comment: string | null
  created_at: number
  updated_at: number
  expiration: number | null
  title: string | null
  description: string | null
  image: string | null
  timer: number | null
  nsfw: number
}

function rowToLink(row: LinkRow): Link {
  return {
    id: row.id,
    url: row.url,
    slug: row.slug,
    ownerUserId: row.owner_user_id,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiration: row.expiration ?? undefined,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    timer: row.timer ?? undefined,
    nsfw: row.nsfw === 1 ? true : undefined,
  }
}

export function normalizeSlug(event: H3Event, slug: string): string {
  const { caseSensitive } = useRuntimeConfig(event)
  return caseSensitive ? slug : slug.toLowerCase()
}

export function buildShortLink(event: H3Event, slug: string): string {
  return `${getRequestProtocol(event)}://${getRequestHost(event)}/${slug}`
}

export async function putLink(event: H3Event, link: Link): Promise<void> {
  const { DB } = event.context.cloudflare.env
  const expiration = getExpiration(event, link.expiration) ?? null

  await DB.prepare(
    `INSERT INTO links (id, url, slug, owner_user_id, comment, created_at, updated_at, expiration, title, description, image, timer, nsfw)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       url = excluded.url,
       owner_user_id = excluded.owner_user_id,
       comment = excluded.comment,
       updated_at = excluded.updated_at,
       expiration = excluded.expiration,
       title = excluded.title,
       description = excluded.description,
       image = excluded.image,
       timer = excluded.timer,
       nsfw = excluded.nsfw`,
  ).bind(
    link.id,
    link.url,
    link.slug,
    link.ownerUserId,
    link.comment ?? null,
    link.createdAt,
    link.updatedAt,
    expiration,
    link.title ?? null,
    link.description ?? null,
    link.image ?? null,
    link.timer ?? null,
    link.nsfw ? 1 : 0,
  ).run()
}

export async function getLink(event: H3Event, slug: string): Promise<Link | null> {
  const { DB } = event.context.cloudflare.env
  const row = await DB.prepare(
    `SELECT * FROM links WHERE slug = ? LIMIT 1`,
  ).bind(slug).first<LinkRow>()
  return row ? rowToLink(row) : null
}

export async function getLinkByOwner(event: H3Event, slug: string, ownerUserId: string): Promise<Link | null> {
  const { DB } = event.context.cloudflare.env
  const row = await DB.prepare(
    `SELECT * FROM links WHERE slug = ? AND owner_user_id = ? LIMIT 1`,
  ).bind(slug, ownerUserId).first<LinkRow>()
  return row ? rowToLink(row) : null
}

// getLinkWithMetadata is kept for backward compatibility but metadata is now embedded in the link row
export async function getLinkWithMetadata(event: H3Event, slug: string): Promise<{ link: Link | null, metadata: Record<string, unknown> | null }> {
  const link = await getLink(event, slug)
  return { link, metadata: link ? { expiration: link.expiration, url: link.url, comment: link.comment } : null }
}

export async function deleteLink(event: H3Event, slug: string): Promise<void> {
  const { DB } = event.context.cloudflare.env
  await DB.prepare(`DELETE FROM links WHERE slug = ?`).bind(slug).run()
}

export async function deleteLinkByOwner(event: H3Event, slug: string, ownerUserId: string): Promise<boolean> {
  const { DB } = event.context.cloudflare.env
  const result = await DB.prepare(
    `DELETE FROM links WHERE slug = ? AND owner_user_id = ?`,
  ).bind(slug, ownerUserId).run()
  return (result.meta?.changes ?? 0) > 0
}

export async function linkExists(event: H3Event, slug: string): Promise<boolean> {
  const link = await getLink(event, slug)
  return link !== null
}

export async function isSlugBanned(event: H3Event, slug: string): Promise<boolean> {
  const { DB } = event.context.cloudflare.env
  const row = await DB.prepare(
    `SELECT slug FROM banned_slugs WHERE slug = ? LIMIT 1`,
  ).bind(slug).first()
  return row !== null
}

interface ListLinksOptions {
  limit: number
  cursor?: string
  ownerUserId?: string
}

interface ListLinksResult {
  links: (Link | null)[]
  list_complete: boolean
  cursor?: string
}

export async function listLinks(event: H3Event, options: ListLinksOptions): Promise<ListLinksResult> {
  const { DB } = event.context.cloudflare.env
  const limit = options.limit
  // D1 doesn't support native cursor pagination like KV; we use offset encoded in cursor
  const offset = options.cursor ? Number.parseInt(options.cursor, 10) : 0

  let query: string
  let bindings: (string | number)[]

  if (options.ownerUserId) {
    query = `SELECT * FROM links WHERE owner_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    bindings = [options.ownerUserId, limit, offset]
  }
  else {
    query = `SELECT * FROM links ORDER BY created_at DESC LIMIT ? OFFSET ?`
    bindings = [limit, offset]
  }

  const result = await DB.prepare(query).bind(...bindings).all<LinkRow>()
  const rows = result.results ?? []
  const links = rows.map(rowToLink)
  const list_complete = rows.length < limit
  const nextOffset = offset + rows.length

  return {
    links,
    list_complete,
    cursor: list_complete ? undefined : String(nextOffset),
  }
}
