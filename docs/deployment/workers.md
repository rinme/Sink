# Deployment on Cloudflare Workers

1. [Fork](https://github.com/miantiao-me/Sink/fork) the repository to your GitHub account.
2. Create a [KV namespace](https://developers.cloudflare.com/kv/) (under **Storage & Databases** -> **KV**), and copy the namespace ID.
3. Update the `kv_namespaces` ID in `wrangler.jsonc` with your own namespace ID.
4. Create a [D1 database](https://developers.cloudflare.com/d1/) for multi-user authentication and link storage:
   ```bash
   wrangler d1 create sink-db
   ```
   Copy the `database_id` from the output and update the `d1_databases` entry in `wrangler.jsonc`.
5. Apply D1 migrations to create the schema:
   ```bash
   wrangler d1 migrations apply sink-db
   ```
6. Create a project in [Cloudflare Workers](https://developers.cloudflare.com/workers/).
7. Select the `Sink` repository and use the following build and deploy commands:
   - **Build command**: `pnpm run build` or `npm run build`
   - **Deploy command**: `npx wrangler deploy`

8. Save and deploy the project.
9. After deployment, go to **Settings** -> **Variables and Secrets** -> **Add**, and configure the following environment variables:
   - `NUXT_SITE_TOKEN`: Must be at least **8** characters long. Used only for the one-time admin bootstrap.
   - `NUXT_CF_ACCOUNT_ID`: Find your [account ID](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/).
   - `NUXT_CF_API_TOKEN`: Create a [Cloudflare API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with at least `Account.Account Analytics` permission. [See reference.](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/#authentication)

10. Enable Analytics Engine. In **Workers & Pages**, go to **Account details** in the right panel, locate **Analytics Engine**, and click **Set up** to enable the free tier. Name them `sink` and `ANALYTICS`, or else overwrite it with `NUXT_DATASET` and update your `wrangler.jsonc` accordingly.
11. Redeploy the project.
12. **Bootstrap your first admin user** (one-time setup):
    ```bash
    curl -X POST https://your-worker.example.com/api/admin/bootstrap \
      -H "Authorization: Bearer YOUR_NUXT_SITE_TOKEN"
    ```
    The response will include a `token` — save it securely. This is your admin API token for the dashboard.
    After bootstrap, `NUXT_SITE_TOKEN` is no longer used for authentication.
13. **Migrate existing KV links to D1** (if you have existing data):
    ```bash
    curl -X POST https://your-worker.example.com/api/admin/migrate-kv \
      -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
    ```
    All KV links will be imported into D1 and assigned to your admin user.
14. To update your code, refer to the official GitHub documentation: [Syncing a fork branch from the web UI](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui 'GitHub: Syncing a fork').

## Multi-User Setup

After bootstrapping, you can create additional users:

```bash
# Create a new regular user
curl -X POST https://your-worker.example.com/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "label": "Alice"}'
```

The response includes a `token` for the new user. Share it with them — each user manages only their own links.

To create additional tokens for a user:
```bash
curl -X POST https://your-worker.example.com/api/admin/tokens \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "label": "My API token"}'
```
