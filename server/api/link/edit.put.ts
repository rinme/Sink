import type { z } from 'zod'
import { LinkSchema } from '@@/schemas/link'

export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot edit links.',
    })
  }

  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const link = await readValidatedBody(event, body =>
    LinkSchema.parse({ ...body, ownerUserId: user.id }),
  )

  const existingLink: z.infer<typeof LinkSchema> | null = await getLink(event, link.slug)
  if (!existingLink) {
    throw createError({
      status: 404,
      statusText: 'Link not found',
    })
  }

  // Admins may edit any link; regular users can only edit their own
  if (user.role !== 'admin' && existingLink.ownerUserId !== user.id) {
    throw createError({ status: 403, statusText: 'You do not have permission to edit this link' })
  }

  // Check banned slug if slug is being changed
  if (link.slug !== existingLink.slug && await isSlugBanned(event, link.slug)) {
    throw createError({ status: 422, statusText: 'Slug is banned or reserved' })
  }

  const newLink = {
    ...existingLink,
    ...link,
    id: existingLink.id,
    ownerUserId: existingLink.ownerUserId,
    createdAt: existingLink.createdAt,
    updatedAt: Math.floor(Date.now() / 1000),
  }
  await putLink(event, newLink)
  setResponseStatus(event, 201)
  const shortLink = buildShortLink(event, newLink.slug)
  return { link: newLink, shortLink }
})
