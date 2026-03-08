import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'
import { parsePath, withQuery } from 'ufo'

function renderTimerPage(target: string, seconds: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Redirecting...</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fafafa; }
  .container { text-align: center; max-width: 480px; padding: 2rem; }
  .countdown { font-size: 4rem; font-weight: 700; margin: 1.5rem 0; font-variant-numeric: tabular-nums; }
  .message { color: #a1a1aa; font-size: 1rem; margin-bottom: 1rem; }
  .url { color: #71717a; font-size: 0.875rem; word-break: break-all; }
</style>
</head>
<body>
<div class="container">
  <p class="message">You will be redirected in</p>
  <div class="countdown" id="timer">${seconds}</div>
  <p class="message">seconds</p>
  <p class="url">${target.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
</div>
<script>
  (function() {
    var remaining = ${seconds};
    var el = document.getElementById('timer');
    var target = ${JSON.stringify(target)};
    var interval = setInterval(function() {
      remaining--;
      el.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(interval);
        window.location.href = target;
      }
    }, 1000);
  })();
</script>
</body>
</html>`
}

function renderNsfwPage(slug: string, hasTimer: boolean, timerSeconds: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Age Verification Required</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fafafa; }
  .container { text-align: center; max-width: 480px; padding: 2rem; }
  h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .subtitle { color: #a1a1aa; font-size: 0.95rem; margin-bottom: 2rem; }
  label { display: block; text-align: left; font-size: 0.875rem; color: #a1a1aa; margin-bottom: 0.5rem; }
  input { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; background: #18181b; border: 1px solid #27272a; border-radius: 0.5rem; color: #fafafa; outline: none; margin-bottom: 1rem; }
  input:focus { border-color: #3b82f6; }
  button { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; font-weight: 600; background: #fafafa; color: #0a0a0a; border: none; border-radius: 0.5rem; cursor: pointer; }
  button:hover { background: #e4e4e7; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .error { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; display: none; }
  .warning-icon { font-size: 3rem; margin-bottom: 1rem; }
</style>
</head>
<body>
<div class="container">
  <div class="warning-icon">&#9888;&#65039;</div>
  <h1>Age Verification Required</h1>
  <p class="subtitle">This link has been marked as NSFW. You must be at least 18 years old to proceed.</p>
  <form id="age-form">
    <label for="birth-year">Enter your birth year</label>
    <input type="number" id="birth-year" placeholder="e.g. 1990" min="1900" max="2026" required>
    <p class="error" id="error-msg"></p>
    <button type="submit">Verify Age</button>
  </form>
</div>
<script>
  (function() {
    var form = document.getElementById('age-form');
    var input = document.getElementById('birth-year');
    var errorEl = document.getElementById('error-msg');
    var slug = ${JSON.stringify(slug)};
    var hasTimer = ${hasTimer ? 'true' : 'false'};
    var timerSeconds = ${timerSeconds};

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      errorEl.style.display = 'none';

      var year = parseInt(input.value, 10);
      if (isNaN(year) || year < 1900 || year > 2026) {
        errorEl.textContent = 'Please enter a valid birth year.';
        errorEl.style.display = 'block';
        return;
      }

      var age = 2026 - year;
      if (age < 18) {
        errorEl.textContent = 'You must be at least 18 years old to access this content.';
        errorEl.style.display = 'block';
        return;
      }

      window.location.href = '/' + encodeURIComponent(slug) + '?_verified=1';
    });
  })();
</script>
</body>
</html>`
}

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.replace(/^\/|\/$/g, '')) // remove leading and trailing slashes
  const { slugRegex, reserveSlug } = useAppConfig()
  const { homeURL, linkCacheTtl, caseSensitive, redirectWithQuery, redirectStatusCode } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  if (slug && !reserveSlug.includes(slug) && slugRegex.test(slug) && cloudflare) {
    const { KV } = cloudflare.env

    let link: z.infer<typeof LinkSchema> | null = null

    const getLink = async (key: string) =>
      await KV.get(`link:${key}`, { type: 'json', cacheTtl: linkCacheTtl })

    const lowerCaseSlug = slug.toLowerCase()
    link = await getLink(caseSensitive ? slug : lowerCaseSlug)

    // fallback to original slug if caseSensitive is false and the slug is not found
    if (!caseSensitive && !link && lowerCaseSlug !== slug) {
      console.log('original slug fallback:', `slug:${slug} lowerCaseSlug:${lowerCaseSlug}`)
      link = await getLink(slug)
    }

    if (link) {
      event.context.link = link
      try {
        await useAccessLog(event)
      }
      catch (error) {
        console.error('Failed write access log:', error)
      }
      const target = redirectWithQuery ? withQuery(link.url, getQuery(event)) : link.url

      // NSFW verification: show age-check page if not yet verified
      if (link.nsfw) {
        const query = getQuery(event)
        if (query._verified !== '1') {
          setResponseHeader(event, 'Content-Type', 'text/html')
          return renderNsfwPage(slug, !!link.timer, link.timer ?? 0)
        }
      }

      // Timer countdown: show countdown page before redirect
      if (link.timer && link.timer > 0) {
        setResponseHeader(event, 'Content-Type', 'text/html')
        return renderTimerPage(target, link.timer)
      }

      return sendRedirect(event, target, +redirectStatusCode)
    }
  }
})
