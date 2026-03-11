defineRouteMeta({
  openAPI: {
    description: 'Verify the API token and return user info',
    responses: {
      200: {
        description: 'The token is valid',
      },
      default: {
        description: 'The token is invalid',
      },
    },
  },
})

export default eventHandler((event) => {
  const user = event.context.user
  return {
    name: 'Sink',
    url: 'https://sink.cool',
    userId: user?.id,
    role: user?.role,
  }
})
