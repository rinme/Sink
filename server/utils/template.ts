import type { Link } from '#shared/schemas/link'
import { escape } from 'es-toolkit/string'
import { parseURL } from 'ufo'

const CLOAKING_IFRAME_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-forms',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-top-navigation-by-user-activation',
  'allow-downloads',
  'allow-modals',
].join(' ')

function buildMetaTags(link: Link, baseUrl: string) {
  const { host: hostname } = parseURL(link.url)
  const title = link.title || hostname || 'Link'
  const hasImage = !!link.image
  const imageUrl = hasImage && link.image!.startsWith('/')
    ? `${baseUrl}${link.image}`
    : link.image
  const twitterCard = hasImage ? 'summary_large_image' : 'summary'

  const tags = [
    link.description ? `<meta name="description" content="${escape(link.description)}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escape(baseUrl)}/${escape(link.slug)}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    link.description ? `<meta property="og:description" content="${escape(link.description)}">` : '',
    hasImage ? `<meta property="og:image" content="${escape(imageUrl!)}">` : '',
    `<meta name="twitter:card" content="${twitterCard}">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    link.description ? `<meta name="twitter:description" content="${escape(link.description)}">` : '',
    hasImage ? `<meta name="twitter:image" content="${escape(imageUrl!)}">` : '',
  ].filter(Boolean).join('\n    ')

  return { title, tags }
}

export function generateCloakingHtml(link: Link, targetUrl: string, baseUrl: string): string {
  const { title, tags } = buildMetaTags(link, baseUrl)

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escape(title)}</title>
    ${tags}
</head>
<body style="margin:0;overflow:hidden">
    <iframe src="${escape(targetUrl)}" style="width:100%;height:100%;width:100vw;height:100vh;border:none" sandbox="${CLOAKING_IFRAME_SANDBOX}" allowfullscreen referrerpolicy="no-referrer"></iframe>
    <noscript><meta http-equiv="refresh" content="0;url=${escape(targetUrl)}"></noscript>
</body>
</html>`
}

interface PasswordHtmlOptions {
  hasError?: boolean
  locale?: RedirectLocale
  queryString?: string
}

export function generatePasswordHtml(slug: string, options: PasswordHtmlOptions = {}): string {
  const { hasError = false, locale = 'en-US', queryString = '' } = options
  const t = REDIRECT_TRANSLATIONS[locale]
  return `<!DOCTYPE html>
<html lang="${escape(locale)}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${escape(t.passwordTitle)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}
      .card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2rem;width:100%;max-width:360px;margin:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)}
      h1{font-size:1.125rem;font-weight:600;margin-bottom:1.5rem;text-align:center;letter-spacing:-.025em}
      .error{color:#ef4444;font-size:.875rem;margin-bottom:1rem;text-align:center;font-weight:500}
      label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem;color:#fafafa}
      input[type=password]{width:100%;padding:.5rem .75rem;background:#09090b;border:1px solid #27272a;border-radius:6px;font-size:.875rem;outline:none;color:#fafafa;margin-bottom:1rem;transition:border-color .15s ease}
      input[type=password]:focus{border-color:#52525b;box-shadow:0 0 0 2px rgba(82,82,91,.3)}
      input[type=password]::placeholder{color:#52525b}
      button{width:100%;padding:.5rem;background:#fafafa;color:#18181b;border:none;border-radius:6px;font-size:.875rem;font-weight:500;cursor:pointer;transition:background-color .15s ease}
      button:hover{background:#e4e4e7}
    </style>
</head>
<body>
    <div class="card">
        <h1>${escape(t.passwordTitle)}</h1>${hasError ? `\n        <p class="error">${escape(t.passwordError)}</p>` : ''}
        <form method="POST" action="/${escape(slug)}${escape(queryString)}">
            <label for="password">${escape(t.passwordLabel)}</label>
            <input type="password" id="password" name="password" required autofocus placeholder="${escape(t.passwordPlaceholder)}">
            <button type="submit">${escape(t.continue)}</button>
        </form>
    </div>
</body>
</html>`
}

interface UnsafeWarningHtmlOptions {
  password?: string
  locale?: RedirectLocale
  queryString?: string
}

export function generateUnsafeWarningHtml(slug: string, targetUrl: string, options: UnsafeWarningHtmlOptions = {}): string {
  const { password, locale = 'en-US', queryString = '' } = options
  const t = REDIRECT_TRANSLATIONS[locale]
  return `<!DOCTYPE html>
<html lang="${escape(locale)}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${escape(t.unsafeTitle)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}
      .card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2rem;width:100%;max-width:420px;margin:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)}
      .warning{display:flex;align-items:center;justify-content:center;gap:.75rem;margin-bottom:1rem}
      .warning svg{width:1.5rem;height:1.5rem;color:#ef4444;flex-shrink:0}
      h1{font-size:1.125rem;font-weight:600;letter-spacing:-.025em;color:#ef4444}
      .desc{font-size:.875rem;color:#a1a1aa;margin-bottom:1rem;line-height:1.5;text-align:center}
      .url{font-size:.8125rem;color:#a1a1aa;background:#18181b;border:1px solid #27272a;border-radius:6px;padding:.5rem .75rem;word-break:break-all;margin-bottom:1.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
      .actions{display:flex;gap:.75rem}
      .btn{flex:1;padding:.5rem;border-radius:6px;font-size:.875rem;font-weight:500;cursor:pointer;text-align:center;text-decoration:none;border:none;transition:background-color .15s ease}
      .btn-back{border:1px solid #27272a;background:#18181b;color:#fafafa}
      .btn-back:hover{background:#27272a}
      .btn-continue{background:#fafafa;color:#18181b}
      .btn-continue:hover{background:#e4e4e7}
    </style>
</head>
<body>
    <div class="card">
        <div class="warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            <h1>${escape(t.unsafeTitle)}</h1>
        </div>
        <p class="desc">${escape(t.unsafeDesc)}</p>
        <div class="url">${escape(targetUrl)}</div>
        <div class="actions">
            <a href="javascript:history.back()" class="btn btn-back">${escape(t.goBack)}</a>
            <form method="POST" action="/${escape(slug)}${escape(queryString)}" style="flex:1;display:flex">
                <input type="hidden" name="confirm" value="true">${password ? `\n                <input type="hidden" name="password" value="${escape(password)}">` : ''}
                <button type="submit" class="btn btn-continue" style="width:100%">${escape(t.continue)}</button>
            </form>
        </div>
    </div>
</body>
</html>`
}

export function generateOgHtml(link: Link, targetUrl: string, baseUrl: string): string {
  const { title, tags } = buildMetaTags(link, baseUrl)

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escape(title)}</title>
    ${tags}
    <meta http-equiv="refresh" content="1;url=${escape(targetUrl)}">
</head>
<body>
    <p>Redirecting to <a href="${escape(targetUrl)}">${escape(targetUrl)}</a>...</p>
</body>
</html>`
}

export async function generateVerificationToken(slug: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`nsfw:${slug}`))
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface NsfwAgeGateHtmlOptions {
  locale?: RedirectLocale
  currentYear?: number
}

export function generateNsfwAgeGateHtml(slug: string, token: string, options: NsfwAgeGateHtmlOptions = {}): string {
  const { locale = 'en-US', currentYear = new Date().getFullYear() } = options
  const t = REDIRECT_TRANSLATIONS[locale]

  return `<!DOCTYPE html>
<html lang="${escape(locale)}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${escape(t.nsfwTitle)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}
      .card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2rem;width:100%;max-width:420px;margin:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);text-align:center}
      .warning{display:flex;align-items:center;justify-content:center;gap:.75rem;margin-bottom:1rem}
      .warning svg{width:1.5rem;height:1.5rem;color:#f59e0b;flex-shrink:0}
      h1{font-size:1.125rem;font-weight:600;letter-spacing:-.025em;color:#fafafa}
      .desc{font-size:.875rem;color:#a1a1aa;margin-bottom:1.5rem;line-height:1.5;text-align:center}
      label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem;color:#fafafa;text-align:left}
      input[type=number]{width:100%;padding:.5rem .75rem;background:#09090b;border:1px solid #27272a;border-radius:6px;font-size:.875rem;outline:none;color:#fafafa;margin-bottom:1rem;transition:border-color .15s ease}
      input[type=number]:focus{border-color:#52525b;box-shadow:0 0 0 2px rgba(82,82,91,.3)}
      input[type=number]::placeholder{color:#52525b}
      .error{color:#ef4444;font-size:.875rem;margin-bottom:1rem;text-align:center;font-weight:500;display:none}
      button{width:100%;padding:.5rem;background:#fafafa;color:#18181b;border:none;border-radius:6px;font-size:.875rem;font-weight:500;cursor:pointer;transition:background-color .15s ease}
      button:hover{background:#e4e4e7}
    </style>
</head>
<body>
    <div class="card">
        <div class="warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            <h1>${escape(t.nsfwTitle)}</h1>
        </div>
        <p class="desc">${escape(t.nsfwDesc)}</p>
        <form id="age-form">
            <label for="birth-year">${escape(t.nsfwBirthYearLabel)}</label>
            <input type="number" id="birth-year" placeholder="${escape(t.nsfwBirthYearPlaceholder)}" min="1900" max="${currentYear}" required autofocus>
            <p class="error" id="error-msg"></p>
            <button type="submit">${escape(t.nsfwVerifyButton)}</button>
        </form>
    </div>
    <script>
      (function() {
        var form = document.getElementById('age-form');
        var input = document.getElementById('birth-year');
        var errorEl = document.getElementById('error-msg');
        var slug = ${JSON.stringify(slug)};
        var token = ${JSON.stringify(token)};
        var currentYear = ${currentYear};
        var underageMsg = ${JSON.stringify(t.nsfwUnderageError)};

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          errorEl.style.display = 'none';

          var year = parseInt(input.value, 10);
          if (isNaN(year) || year < 1900 || year > currentYear) {
            errorEl.textContent = underageMsg;
            errorEl.style.display = 'block';
            return;
          }

          var age = currentYear - year;
          if (age < 18) {
            errorEl.textContent = underageMsg;
            errorEl.style.display = 'block';
            return;
          }

          var dest = '/' + encodeURIComponent(slug);
          var search = window.location.search;
          if (search) {
            var params = new URLSearchParams(search);
            params.set('_verified', token);
            dest += '?' + params.toString();
          } else {
            dest += '?_verified=' + encodeURIComponent(token);
          }
          window.location.href = dest;
        });
      })();
    </script>
</body>
</html>`
}

interface TimerCountdownHtmlOptions {
  locale?: RedirectLocale
}

export function generateTimerCountdownHtml(targetUrl: string, seconds: number, options: TimerCountdownHtmlOptions = {}): string {
  const { locale = 'en-US' } = options
  const t = REDIRECT_TRANSLATIONS[locale]

  return `<!DOCTYPE html>
<html lang="${escape(locale)}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="${seconds};url=${escape(targetUrl)}">
    <title>${escape(t.timerRedirecting)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}
      .card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2.5rem 2rem;width:100%;max-width:420px;margin:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);text-align:center}
      .message{color:#a1a1aa;font-size:1rem;margin-bottom:.5rem}
      .countdown{font-size:3.5rem;font-weight:700;margin:1rem 0;font-variant-numeric:tabular-nums;letter-spacing:-.05em;color:#fafafa}
      .unit{color:#a1a1aa;font-size:.875rem;margin-bottom:1.5rem}
      .url{font-size:.8125rem;color:#71717a;background:#18181b;border:1px solid #27272a;border-radius:6px;padding:.5rem .75rem;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
    </style>
</head>
<body>
    <div class="card">
        <p class="message">${escape(t.timerRedirecting)}</p>
        <div class="countdown" id="timer">${seconds}</div>
        <p class="unit">${escape(t.timerSeconds)}</p>
        <div class="url">${escape(targetUrl)}</div>
    </div>
    <script>
      (function() {
        var remaining = ${seconds};
        var el = document.getElementById('timer');
        var target = ${JSON.stringify(targetUrl)};
        var interval = setInterval(function() {
          remaining--;
          if (el) el.textContent = remaining;
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
