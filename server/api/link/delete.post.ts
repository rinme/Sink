import { LinkSchema } from '@@/schemas/link'
import { z } from 'zod'

const DeleteSchema = z.object({
  slug: LinkSchema.shape.slug.removeDefault().min(1),
})

export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot delete links.',
    })
  }

  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const { slug } = await readValidatedBody(event, DeleteSchema.parse)

  // Admins may delete any link; regular users can only delete their own
  if (user.role !== 'admin') {
    const deleted = await deleteLinkByOwner(event, slug, user.id)
    if (!deleted) {
      throw createError({ status: 404, statusText: 'Link not found or you do not have permission to delete it' })
    }
  }
  else {
    await deleteLink(event, slug)
  }

  setResponseStatus(event, 204)
})
