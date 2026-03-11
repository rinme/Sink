export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  const { DB } = event.context.cloudflare.env

  // Admins see all links; regular users see only their own
  let rows: Array<{ slug: string, url: string, comment: string | null }>
  if (user.role === 'admin') {
    const result = await DB.prepare(
      `SELECT slug, url, comment FROM links ORDER BY created_at DESC`,
    ).all<{ slug: string, url: string, comment: string | null }>()
    rows = result.results ?? []
  }
  else {
    const result = await DB.prepare(
      `SELECT slug, url, comment FROM links WHERE owner_user_id = ? ORDER BY created_at DESC`,
    ).bind(user.id).all<{ slug: string, url: string, comment: string | null }>()
    rows = result.results ?? []
  }

  return rows.map(row => ({
    slug: row.slug,
    url: row.url,
    comment: row.comment ?? undefined,
  }))
})
