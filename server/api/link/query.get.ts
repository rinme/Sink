import { z } from 'zod'

const QueryParamsSchema = z.object({
  slug: z.string().trim().min(1).max(2048),
})

export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const { slug } = await getValidatedQuery(event, QueryParamsSchema.parse)

  const link = await getLink(event, slug)
  if (!link) {
    throw createError({ status: 404, statusText: 'Not Found' })
  }

  // Regular users can only query their own links
  if (user.role !== 'admin' && link.ownerUserId !== user.id) {
    throw createError({ status: 404, statusText: 'Not Found' })
  }

  return link
})
