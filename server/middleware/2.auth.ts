import { requireUser } from '../utils/auth'

export default eventHandler(async (event) => {
  if (!event.path.startsWith('/api/') || event.path.startsWith('/api/_'))
    return

  // Bootstrap endpoint uses NUXT_SITE_TOKEN directly
  if (event.path === '/api/admin/bootstrap')
    return

  const user = await requireUser(event)
  event.context.user = user
})
