import type { Link } from '../../shared/schemas/link'
import { env } from 'cloudflare:test'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { describe, expect, it, vi } from 'vitest'
import { links } from '../../server/database/schema'
import { buildD1LinkValues } from '../../server/services/link-store/d1'
import { CreateLinkSchema, EditLinkSchema, ImportLinkSchema, StoredLinkSchema } from '../../shared/schemas/link'

vi.hoisted(() => {
  Object.assign(globalThis, {
    useAppConfig: () => ({ slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i }),
    useRuntimeConfig: () => ({ public: { slugDefaultLength: '6' } }),
  })
})

describe('linkSchema with fork extensions', () => {
  it('validates timer and nsfw fields on link creation', () => {
    const input = {
      url: 'https://example.com',
      slug: 'test-fork',
      timer: 5,
      nsfw: true,
    }
    const parsed = CreateLinkSchema.parse(input)
    expect(parsed.timer).toBe(5)
    expect(parsed.nsfw).toBe(true)
  })

  it('rejects invalid timer values outside 1-60', () => {
    const inputOver = {
      url: 'https://example.com',
      slug: 'test-fork-invalid-over',
      timer: 99,
    }
    expect(() => CreateLinkSchema.parse(inputOver)).toThrow()

    const inputUnder = {
      url: 'https://example.com',
      slug: 'test-fork-invalid-under',
      timer: 0,
    }
    expect(() => CreateLinkSchema.parse(inputUnder)).toThrow()

    const inputFloat = {
      url: 'https://example.com',
      slug: 'test-fork-invalid-float',
      timer: 5.5,
    }
    expect(() => CreateLinkSchema.parse(inputFloat)).toThrow()
  })

  it('accepts boundary timer values 1 and 60', () => {
    const minInput = {
      url: 'https://example.com',
      slug: 'test-fork-min',
      timer: 1,
    }
    expect(CreateLinkSchema.parse(minInput).timer).toBe(1)

    const maxInput = {
      url: 'https://example.com',
      slug: 'test-fork-max',
      timer: 60,
    }
    expect(CreateLinkSchema.parse(maxInput).timer).toBe(60)
  })

  it('validates timer and nsfw fields on stored link', () => {
    const input = {
      id: 'test-id-1234',
      url: 'https://example.com',
      slug: 'test-fork',
      createdAt: 1700000000,
      updatedAt: 1700000000,
      timer: 10,
      nsfw: false,
    }
    const parsed = StoredLinkSchema.parse(input)
    expect(parsed.timer).toBe(10)
    expect(parsed.nsfw).toBe(false)
  })

  it('validates timer and nsfw fields on edit and import schemas', () => {
    const editInput = {
      url: 'https://example.com',
      slug: 'test-fork',
      timer: 30,
      nsfw: true,
    }
    const parsedEdit = EditLinkSchema.parse(editInput)
    expect(parsedEdit.timer).toBe(30)
    expect(parsedEdit.nsfw).toBe(true)

    const importInput = {
      url: 'https://example.com',
      slug: 'test-fork',
      timer: 15,
      nsfw: false,
    }
    const parsedImport = ImportLinkSchema.parse(importInput)
    expect(parsedImport.timer).toBe(15)
    expect(parsedImport.nsfw).toBe(false)
  })

  it('maps timer and nsfw in buildD1LinkValues', () => {
    const link: Link = {
      id: 'test-id',
      slug: 'test-slug',
      url: 'https://example.com',
      createdAt: 1000,
      updatedAt: 1000,
      tags: [],
      timer: 20,
      nsfw: true,
    }
    const row = buildD1LinkValues({} as any, link, null)
    expect(row.timer).toBe(20)
    expect(row.nsfw).toBe(true)

    const emptyLink: Link = {
      id: 'test-id-2',
      slug: 'test-slug-2',
      url: 'https://example.com',
      createdAt: 1000,
      updatedAt: 1000,
      tags: [],
    }
    const emptyRow = buildD1LinkValues({} as any, emptyLink, null)
    expect(emptyRow.timer).toBeNull()
    expect(emptyRow.nsfw).toBeNull()
  })

  it('persists and retrieves timer and nsfw in D1 database', async () => {
    const db = drizzle(env.DB)
    const slug = `test-fork-db-${Date.now()}`
    const link: Link = {
      id: 'db-test-id',
      slug,
      url: 'https://example.com/target',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      tags: [],
      timer: 15,
      nsfw: true,
    }
    const values = buildD1LinkValues({} as any, link, null)
    await db.insert(links).values(values)

    const [row] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)
    expect(row).toBeDefined()
    expect(row.timer).toBe(15)
    expect(row.nsfw).toBe(true)

    await db.delete(links).where(eq(links.slug, slug))
  })
})
