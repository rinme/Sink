import { z } from 'zod'

const ListQuerySchema = z.object({
  limit: z.coerce.number().max(1024).default(20),
  cursor: z.string().trim().max(1024).optional(),
})

export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const { limit, cursor } = await getValidatedQuery(event, ListQuerySchema.parse)

  // Admins see all links; regular users see only their own
  const ownerUserId = user.role === 'admin' ? undefined : user.id

  const list = await listLinks(event, { limit, cursor, ownerUserId })
  return list
})
