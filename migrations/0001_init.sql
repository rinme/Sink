-- D1 initial schema for multi-user Sink
-- Run: wrangler d1 execute sink-db --file migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS api_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  created_at INTEGER NOT NULL,
  revoked_at INTEGER,
  last_used_at INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON api_tokens(user_id);

CREATE TABLE IF NOT EXISTS links (
  id TEXT NOT NULL,
  url TEXT NOT NULL,
  slug TEXT NOT NULL PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  comment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expiration INTEGER,
  title TEXT,
  description TEXT,
  image TEXT,
  timer INTEGER,
  nsfw INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_links_owner ON links(owner_user_id);

CREATE TABLE IF NOT EXISTS banned_slugs (
  slug TEXT PRIMARY KEY,
  reason TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
);
