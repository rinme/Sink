import { LinkSchema } from '@@/schemas/link'

export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const link = await readValidatedBody(event, body =>
    LinkSchema.parse({ ...body, ownerUserId: user.id }),
  )

  link.slug = normalizeSlug(event, link.slug)

  // Check banned slugs
  if (await isSlugBanned(event, link.slug)) {
    throw createError({ status: 422, statusText: 'Slug is banned or reserved' })
  }

  const existingLink = await getLink(event, link.slug)
  if (existingLink) {
    // Admins may upsert any link; regular users can only upsert their own
    if (user.role !== 'admin' && existingLink.ownerUserId !== user.id) {
      throw createError({ status: 403, statusText: 'You do not have permission to update this link' })
    }
    const shortLink = buildShortLink(event, link.slug)
    return { link: existingLink, shortLink, status: 'existing' }
  }

  await putLink(event, link)
  setResponseStatus(event, 201)
  const shortLink = buildShortLink(event, link.slug)
  return { link, shortLink, status: 'created' }
})
