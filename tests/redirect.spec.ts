import { describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth } from './utils'

async function generateVerificationToken(slug: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`nsfw:${slug}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')
}

const nsfwSlug = 'nsfw-test-link'
const timerSlug = 'timer-test-link'

describe.sequential('nSFW redirect', () => {
  it('creates an NSFW link', async () => {
    const response = await fetchWithAuth('/api/link/create', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com', slug: nsfwSlug, nsfw: true }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(201)
  })

  it('returns age verification HTML when _verified is missing', async () => {
    const response = await fetch(`/${nsfwSlug}`, { redirect: 'manual' })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')

    const body = await response.text()
    expect(body).toContain('Age Verification Required')
    expect(body).toContain('birth-year')
  })

  it('redirects when a valid _verified token is provided', async () => {
    const token = await generateVerificationToken(nsfwSlug, import.meta.env.NUXT_SITE_TOKEN)
    const response = await fetch(`/${nsfwSlug}?_verified=${token}`, { redirect: 'manual' })

    expect([301, 302, 307, 308]).toContain(response.status)
    expect(response.headers.get('location')).toBe('https://example.com')
  })

  it('returns age verification HTML when _verified token is invalid', async () => {
    const response = await fetch(`/${nsfwSlug}?_verified=invalidtoken`, { redirect: 'manual' })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')

    const body = await response.text()
    expect(body).toContain('Age Verification Required')
  })

  it('cleans up NSFW test link', async () => {
    const response = await fetchWithAuth('/api/link/delete', {
      method: 'POST',
      body: JSON.stringify({ slug: nsfwSlug }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(204)
  })
})

describe.sequential('timer redirect', () => {
  it('creates a link with timer', async () => {
    const response = await fetchWithAuth('/api/link/create', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com', slug: timerSlug, timer: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(201)
  })

  it('returns countdown HTML instead of redirecting', async () => {
    const response = await fetch(`/${timerSlug}`, { redirect: 'manual' })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')

    const body = await response.text()
    expect(body).toContain('Redirecting')
    expect(body).toContain('id="timer"')
  })

  it('cleans up timer test link', async () => {
    const response = await fetchWithAuth('/api/link/delete', {
      method: 'POST',
      body: JSON.stringify({ slug: timerSlug }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(204)
  })
})
