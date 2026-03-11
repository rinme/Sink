/// <reference path="../../worker-configuration.d.ts" />

import type { Link } from '@@/app/types'

interface BackupData {
  version: string
  exportedAt: string
  count: number
  links: Link[]
}

async function backupD1ToR2(env: Cloudflare.Env): Promise<void> {
  if (!env.R2) {
    console.info('[backup:d1] R2 binding not configured, skipping backup')
    return
  }

  if (!env.DB) {
    console.info('[backup:d1] D1 database not configured, skipping backup')
    return
  }

  const allLinks: Link[] = []
  const pageSize = 1000
  let offset = 0

  while (true) {
    const result = await env.DB.prepare(
      `SELECT * FROM links ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ).bind(pageSize, offset).all<{
      id: string, url: string, slug: string, owner_user_id: string,
      comment: string | null, created_at: number, updated_at: number,
      expiration: number | null, title: string | null, description: string | null,
      image: string | null, timer: number | null, nsfw: number,
    }>()

    const rows = result.results ?? []

    const links = rows.map(row => ({
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
    } as Link))

    allLinks.push(...links)

    if (rows.length < pageSize)
      break
    offset += rows.length
  }

  const now = new Date()
  const backupData: BackupData = {
    version: '1.0',
    exportedAt: now.toISOString(),
    count: allLinks.length,
    links: allLinks,
  }

  const timestamp = now.toISOString().replace(/:/g, '-')
  const filename = `backups/links-${timestamp}.json`

  await env.R2.put(filename, JSON.stringify(backupData, null, 2), {
    httpMetadata: {
      contentType: 'application/json',
    },
    customMetadata: {
      count: String(allLinks.length),
      exportedAt: backupData.exportedAt,
    },
  })

  console.info(`[backup:d1] Backup completed: ${filename}, ${allLinks.length} links`)
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async (event) => {
    const config = useRuntimeConfig()

    if (config.disableAutoBackup) {
      console.info('[backup:d1] Auto backup is disabled by configuration')
      return
    }

    const env = event.env as Cloudflare.Env
    await backupD1ToR2(env)
  })
})
