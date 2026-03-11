# Multi-User Authentication & D1 Migration

Sink supports true multi-user mode where each user only sees and manages their own links. Authentication uses per-user API tokens stored in a Cloudflare D1 database.

## Architecture

| Component | Before | After |
|-----------|--------|-------|
| Auth | Single `NUXT_SITE_TOKEN` | Per-user tokens in D1 |
| Link storage | Cloudflare KV | Cloudflare D1 |
| Roles | None | `user` / `admin` |
| Slug uniqueness | Global | Global (slugs are still unique across all users) |

## D1 Schema

Tables created by `migrations/0001_init.sql`:

- **`users`** — user accounts with roles (`user` or `admin`)
- **`api_tokens`** — hashed API tokens, one-to-many per user
- **`links`** — short links with `owner_user_id` foreign key
- **`banned_slugs`** — admin-managed list of blocked slugs

## Setup Steps

### 1. Create and configure D1

```bash
# Create the D1 database
wrangler d1 create sink-db

# Apply the schema migrations
wrangler d1 migrations apply sink-db
```

Update `wrangler.jsonc` with the `database_id` returned by the create command.

### 2. Bootstrap the first admin

Call the bootstrap endpoint using your `NUXT_SITE_TOKEN`. This can only be done once (when no users exist):

```bash
curl -X POST https://your-sink.example.com/api/admin/bootstrap \
  -H "Authorization: Bearer YOUR_NUXT_SITE_TOKEN"
```

Response:
```json
{
  "message": "Admin user created. Store the token securely — it will not be shown again.",
  "userId": "abc123",
  "token": "your-admin-token-here"
}
```

**Save the token** — it is shown only once. Use it in the dashboard login.

### 3. Migrate existing KV data (optional)

If you have existing links in KV, migrate them to D1 with a single call. Migrated links are assigned to the calling admin user:

```bash
curl -X POST https://your-sink.example.com/api/admin/migrate-kv \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:
```json
{
  "migrated": 42,
  "skipped": 0,
  "failed": 0,
  "errors": []
}
```

This operation is idempotent — running it again will skip already-imported slugs.

## Admin API Reference

All admin endpoints require `Authorization: Bearer <admin-token>`.

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/users` | List all users with token/link counts |
| `POST` | `/api/admin/users` | Create a new user and issue a token |

**Create user body:**
```json
{
  "role": "user",
  "label": "Alice (optional token label)"
}
```

### Tokens

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/tokens` | Issue a new token for any user |
| `DELETE` | `/api/admin/tokens` | Revoke a token |

**Create token body:**
```json
{ "userId": "abc123", "label": "My new token" }
```

**Revoke token body:**
```json
{ "tokenId": "tok456" }
```

### Banned Slugs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/banned-slugs` | List all banned slugs |
| `POST` | `/api/admin/banned-slugs` | Ban a slug |
| `DELETE` | `/api/admin/banned-slugs` | Unban a slug |

**Ban slug body:**
```json
{ "slug": "reserved-slug", "reason": "System reserved" }
```

## Permissions Summary

| Action | User | Admin |
|--------|------|-------|
| Create link | Own links only | Any |
| Edit link | Own links only | Any |
| Delete link | Own links only | Any |
| List links | Own links only | All links |
| Export links | Own links only | All links |
| Import links | Assigned to self | Assigned to self |
| Manage users/tokens | ❌ | ✅ |
| Manage banned slugs | ❌ | ✅ |
| KV migration | ❌ | ✅ |

## Backward Compatibility

`NUXT_SITE_TOKEN` continues to work as an admin super-token **until** the first admin user is bootstrapped via D1. After bootstrap, only D1-registered tokens are accepted.

This means:
- Existing deployments continue working without any changes
- After bootstrapping D1, use the issued token instead of `NUXT_SITE_TOKEN`
