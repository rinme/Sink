import { ImportDataSchema } from '@@/schemas/import'
import { nanoid } from '@@/schemas/link'

interface ImportResultItem {
  index: number
  slug: string
  url: string
}

interface ImportResult {
  success: number
  skipped: number
  failed: number
  successItems: ImportResultItem[]
  skippedItems: ImportResultItem[]
  failedItems: (ImportResultItem & { reason: string })[]
}

export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const kvBatchLimit = useRuntimeConfig(event).public.kvBatchLimit as string
  const maxLinks = Math.floor(+kvBatchLimit / 2)

  const importData = await readValidatedBody(event, ImportDataSchema.parse)

  if (importData.links.length > maxLinks) {
    throw createError({
      status: 400,
      statusText: `Too many links. Maximum ${maxLinks} links per request.`,
    })
  }

  const result: ImportResult = {
    success: 0,
    skipped: 0,
    failed: 0,
    successItems: [],
    skippedItems: [],
    failedItems: [],
  }

  for (let i = 0; i < importData.links.length; i++) {
    const linkData = importData.links[i]

    try {
      const slug = normalizeSlug(event, linkData.slug)

      // Check if slug is banned
      if (await isSlugBanned(event, slug)) {
        result.failedItems.push({ index: i, slug, url: linkData.url, reason: 'Slug is banned or reserved' })
        result.failed++
        continue
      }

      const existingLink = await getLink(event, slug)

      if (existingLink) {
        result.skippedItems.push({ index: i, slug, url: linkData.url })
        result.skipped++
        continue
      }

      const now = Math.floor(Date.now() / 1000)
      const link = {
        id: linkData.id || nanoid(10)(),
        url: linkData.url,
        slug,
        ownerUserId: user.id,
        comment: linkData.comment,
        createdAt: linkData.createdAt || now,
        updatedAt: linkData.updatedAt || now,
        expiration: linkData.expiration,
        title: linkData.title,
        description: linkData.description,
        image: linkData.image,
        timer: linkData.timer,
        nsfw: linkData.nsfw,
      }

      await putLink(event, link)
      result.successItems.push({ index: i, slug, url: linkData.url })
      result.success++
    }
    catch (error) {
      result.failed++
      result.failedItems.push({
        index: i,
        slug: linkData.slug,
        url: linkData.url,
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')

  return result
})
