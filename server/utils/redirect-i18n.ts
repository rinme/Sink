import type { H3Event } from 'h3'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

interface RedirectTranslation {
  passwordTitle: string
  passwordLabel: string
  passwordPlaceholder: string
  passwordError: string
  continue: string
  unsafeTitle: string
  unsafeDesc: string
  goBack: string
  nsfwTitle: string
  nsfwDesc: string
  nsfwBirthYearLabel: string
  nsfwBirthYearPlaceholder: string
  nsfwVerifyButton: string
  nsfwUnderageError: string
  timerRedirecting: string
  timerSeconds: string
}

const REDIRECT_LOCALES = [
  'de-DE',
  'en-US',
  'fr-FR',
  'id-ID',
  'it-IT',
  'pt-BR',
  'pt-PT',
  'th-TH',
  'vi-VN',
  'zh-CN',
  'zh-TW',
] as const

export type RedirectLocale = typeof REDIRECT_LOCALES[number]

const DEFAULT_REDIRECT_LOCALE = 'en-US' satisfies RedirectLocale
const REDIRECT_LOCALE_COOKIE = 'sink_i18n_redirected'

export const REDIRECT_TRANSLATIONS = {
  'de-DE': {
    passwordTitle: 'Passwort erforderlich',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Passwort eingeben',
    passwordError: 'Falsches Passwort',
    continue: 'Weiter',
    unsafeTitle: 'Potenziell unsicherer Link',
    unsafeDesc: 'Dieser Link wurde als potenziell unsicher markiert. Gehen Sie mit Vorsicht vor.',
    goBack: 'Zurück',
    nsfwTitle: 'Altersverifizierung erforderlich',
    nsfwDesc: 'Dieser Link wurde als nicht jugendfrei (NSFW) eingestuft. Sie müssen mindestens 18 Jahre alt sein, um fortzufahren.',
    nsfwBirthYearLabel: 'Geben Sie Ihr Geburtsjahr ein',
    nsfwBirthYearPlaceholder: 'z.B. 1990',
    nsfwVerifyButton: 'Alter bestätigen',
    nsfwUnderageError: 'Sie müssen mindestens 18 Jahre alt sein, um auf diesen Inhalt zuzugreifen.',
    timerRedirecting: 'Sie werden weitergeleitet in',
    timerSeconds: 'Sekunden',
  },
  'en-US': {
    passwordTitle: 'Password Required',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    passwordError: 'Incorrect password',
    continue: 'Continue',
    unsafeTitle: 'Potentially Unsafe Link',
    unsafeDesc: 'This link has been flagged as potentially unsafe. Proceed with caution.',
    goBack: 'Go Back',
    nsfwTitle: 'Age Verification Required',
    nsfwDesc: 'This link has been marked as NSFW. You must be at least 18 years old to proceed.',
    nsfwBirthYearLabel: 'Enter your birth year',
    nsfwBirthYearPlaceholder: 'e.g. 1990',
    nsfwVerifyButton: 'Verify Age',
    nsfwUnderageError: 'You must be at least 18 years old to access this content.',
    timerRedirecting: 'You will be redirected in',
    timerSeconds: 'seconds',
  },
  'fr-FR': {
    passwordTitle: 'Mot de passe requis',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Entrez le mot de passe',
    passwordError: 'Mot de passe incorrect',
    continue: 'Continuer',
    unsafeTitle: 'Lien potentiellement dangereux',
    unsafeDesc: 'Ce lien a été signalé comme potentiellement dangereux. Procédez avec prudence.',
    goBack: 'Retour',
    nsfwTitle: 'Vérification de l\'âge requise',
    nsfwDesc: 'Ce lien a été marqué comme NSFW. Vous devez avoir au moins 18 ans pour continuer.',
    nsfwBirthYearLabel: 'Entrez votre année de naissance',
    nsfwBirthYearPlaceholder: 'ex. 1990',
    nsfwVerifyButton: 'Vérifier l\'âge',
    nsfwUnderageError: 'Vous devez avoir au moins 18 ans pour accéder à ce contenu.',
    timerRedirecting: 'Vous serez redirigé dans',
    timerSeconds: 'secondes',
  },
  'id-ID': {
    passwordTitle: 'Diperlukan Kata Sandi',
    passwordLabel: 'Kata Sandi',
    passwordPlaceholder: 'Masukkan kata sandi',
    passwordError: 'Kata sandi salah',
    continue: 'Lanjutkan',
    unsafeTitle: 'Tautan Berpotensi Tidak Aman',
    unsafeDesc: 'Tautan ini telah ditandai berpotensi tidak aman. Lanjutkan dengan hati-hati.',
    goBack: 'Kembali',
    nsfwTitle: 'Verifikasi Usia Diperlukan',
    nsfwDesc: 'Tautan ini telah ditandai sebagai NSFW. Anda harus berusia minimal 18 tahun untuk melanjutkan.',
    nsfwBirthYearLabel: 'Masukkan tahun kelahiran Anda',
    nsfwBirthYearPlaceholder: 'contoh: 1990',
    nsfwVerifyButton: 'Verifikasi Usia',
    nsfwUnderageError: 'Anda harus berusia minimal 18 tahun untuk mengakses konten ini.',
    timerRedirecting: 'Anda akan dialihkan dalam',
    timerSeconds: 'detik',
  },
  'it-IT': {
    passwordTitle: 'Password richiesta',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Inserisci la password',
    passwordError: 'Password errata',
    continue: 'Continua',
    unsafeTitle: 'Link potenzialmente non sicuro',
    unsafeDesc: 'Questo link è stato contrassegnato come potenzialmente non sicuro. Procedi con cautela.',
    goBack: 'Indietro',
    nsfwTitle: 'Verifica dell\'età richiesta',
    nsfwDesc: 'Questo link è stato contrassegnato come NSFW. Devi avere almeno 18 anni per procedere.',
    nsfwBirthYearLabel: 'Inserisci il tuo anno di nascita',
    nsfwBirthYearPlaceholder: 'es. 1990',
    nsfwVerifyButton: 'Verifica età',
    nsfwUnderageError: 'Devi avere almeno 18 anni per accedere a questo contenuto.',
    timerRedirecting: 'Verrai reindirizzato tra',
    timerSeconds: 'secondi',
  },
  'pt-BR': {
    passwordTitle: 'Senha necessária',
    passwordLabel: 'Senha',
    passwordPlaceholder: 'Digite a senha',
    passwordError: 'Senha incorreta',
    continue: 'Continuar',
    unsafeTitle: 'Link potencialmente inseguro',
    unsafeDesc: 'Este link foi sinalizado como potencialmente inseguro. Prossiga com cuidado.',
    goBack: 'Voltar',
    nsfwTitle: 'Verificação de idade necessária',
    nsfwDesc: 'Este link foi marcado como NSFW. Você deve ter pelo menos 18 anos para prosseguir.',
    nsfwBirthYearLabel: 'Digite seu ano de nascimento',
    nsfwBirthYearPlaceholder: 'ex. 1990',
    nsfwVerifyButton: 'Verificar idade',
    nsfwUnderageError: 'Você deve ter pelo menos 18 anos para acessar este conteúdo.',
    timerRedirecting: 'Você será redirecionado em',
    timerSeconds: 'segundos',
  },
  'pt-PT': {
    passwordTitle: 'Palavra-passe necessária',
    passwordLabel: 'Palavra-passe',
    passwordPlaceholder: 'Introduza a palavra-passe',
    passwordError: 'Palavra-passe incorreta',
    continue: 'Continuar',
    unsafeTitle: 'Ligação potencialmente insegura',
    unsafeDesc: 'Esta ligação foi assinalada como potencialmente insegura. Prossiga com cuidado.',
    goBack: 'Voltar',
    nsfwTitle: 'Verificação de idade necessária',
    nsfwDesc: 'Esta ligação foi marcada como NSFW. Tem de ter pelo menos 18 anos para prosseguir.',
    nsfwBirthYearLabel: 'Introduza o seu ano de nascimento',
    nsfwBirthYearPlaceholder: 'ex. 1990',
    nsfwVerifyButton: 'Verificar idade',
    nsfwUnderageError: 'Tem de ter pelo menos 18 anos para aceder a este conteúdo.',
    timerRedirecting: 'Será redirecionado em',
    timerSeconds: 'segundos',
  },
  'th-TH': {
    passwordTitle: 'ต้องใช้รหัสผ่าน',
    passwordLabel: 'รหัสผ่าน',
    passwordPlaceholder: 'กรอกรหัสผ่าน',
    passwordError: 'รหัสผ่านไม่ถูกต้อง',
    continue: 'ดำเนินการต่อ',
    unsafeTitle: 'ลิงก์ที่อาจไม่ปลอดภัย',
    unsafeDesc: 'ลิงก์นี้ถูกทำเครื่องหมายว่าอาจไม่ปลอดภัย โปรดดำเนินการด้วยความระมัดระวัง',
    goBack: 'ย้อนกลับ',
    nsfwTitle: 'ต้องยืนยันอายุ',
    nsfwDesc: 'ลิงก์นี้ถูกทำเครื่องหมายเป็น NSFW คุณต้องมีอายุอย่างน้อย 18 ปีจึงจะสามารถดำเนินการต่อได้',
    nsfwBirthYearLabel: 'กรอกปีเกิดของคุณ (ค.ศ.)',
    nsfwBirthYearPlaceholder: 'เช่น 1990',
    nsfwVerifyButton: 'ยืนยันอายุ',
    nsfwUnderageError: 'คุณต้องมีอายุอย่างน้อย 18 ปีจึงจะเข้าถึงเนื้อหานี้ได้',
    timerRedirecting: 'คุณจะถูกเปลี่ยนเส้นทางในอีก',
    timerSeconds: 'วินาที',
  },
  'vi-VN': {
    passwordTitle: 'Yêu cầu mật khẩu',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    passwordError: 'Mật khẩu không đúng',
    continue: 'Tiếp tục',
    unsafeTitle: 'Liên kết có thể không an toàn',
    unsafeDesc: 'Liên kết này đã bị đánh dấu là có thể không an toàn. Hãy thận trọng khi tiếp tục.',
    goBack: 'Quay lại',
    nsfwTitle: 'Yêu cầu xác minh độ tuổi',
    nsfwDesc: 'Liên kết này được đánh dấu là NSFW. Bạn phải đủ 18 tuổi trở lên để tiếp tục.',
    nsfwBirthYearLabel: 'Nhập năm sinh của bạn',
    nsfwBirthYearPlaceholder: 'ví dụ 1990',
    nsfwVerifyButton: 'Xác minh độ tuổi',
    nsfwUnderageError: 'Bạn phải đủ 18 tuổi trở lên để truy cập nội dung này.',
    timerRedirecting: 'Bạn sẽ được chuyển hướng sau',
    timerSeconds: 'giây',
  },
  'zh-CN': {
    passwordTitle: '需要密码',
    passwordLabel: '密码',
    passwordPlaceholder: '请输入密码',
    passwordError: '密码错误',
    continue: '继续',
    unsafeTitle: '潜在不安全链接',
    unsafeDesc: '此链接已被标记为潜在不安全。请谨慎访问。',
    goBack: '返回',
    nsfwTitle: '需要年龄验证',
    nsfwDesc: '此链接已被标记为 NSFW 内容。您必须年满 18 周岁方可继续访问。',
    nsfwBirthYearLabel: '请输入出生年份',
    nsfwBirthYearPlaceholder: '例如 1990',
    nsfwVerifyButton: '验证年龄',
    nsfwUnderageError: '您必须年满 18 周岁才能访问此内容。',
    timerRedirecting: '您将在',
    timerSeconds: '秒后被重定向',
  },
  'zh-TW': {
    passwordTitle: '需要密碼',
    passwordLabel: '密碼',
    passwordPlaceholder: '請輸入密碼',
    passwordError: '密碼錯誤',
    continue: '繼續',
    unsafeTitle: '潛在不安全連結',
    unsafeDesc: '此連結已被標記為潛在不安全。請謹慎訪問。',
    goBack: '返回',
    nsfwTitle: '需要年齡驗證',
    nsfwDesc: '此連結已被標記為 NSFW 內容。您必須年滿 18 歲方可繼續訪問。',
    nsfwBirthYearLabel: '請輸入出生年份',
    nsfwBirthYearPlaceholder: '例如 1990',
    nsfwVerifyButton: '驗證年齡',
    nsfwUnderageError: '您必須年滿 18 歲才能訪問此內容。',
    timerRedirecting: '您將在',
    timerSeconds: '秒後被重定向',
  },
} as const satisfies Record<RedirectLocale, RedirectTranslation>

const SUPPORTED_LOCALES = [...REDIRECT_LOCALES]

const LOCALE_ALIASES: Record<string, RedirectLocale> = {
  'de': 'de-DE',
  'en': 'en-US',
  'fr': 'fr-FR',
  'id': 'id-ID',
  'it': 'it-IT',
  'pt': 'pt-BR',
  'th': 'th-TH',
  'vi': 'vi-VN',
  'zh': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-MO': 'zh-TW',
}

function normalizeLocaleCode(code: string): string {
  const normalized = code.replace('_', '-')
  try {
    return Intl.getCanonicalLocales(normalized)[0] || ''
  }
  catch {
    return ''
  }
}

function resolveLocaleCode(code: string | undefined): RedirectLocale | undefined {
  if (!code)
    return undefined

  const normalized = normalizeLocaleCode(code)
  if (!normalized)
    return undefined

  if (SUPPORTED_LOCALES.includes(normalized as RedirectLocale))
    return normalized as RedirectLocale

  const alias = LOCALE_ALIASES[normalized]
  if (alias)
    return alias

  const prefix = normalized.split('-')[0]
  return prefix ? LOCALE_ALIASES[prefix] : undefined
}

export function resolveRedirectLocale(event: H3Event): RedirectLocale {
  const cookieLocale = resolveLocaleCode(getCookie(event, REDIRECT_LOCALE_COOKIE))
  if (cookieLocale)
    return cookieLocale

  const header = getHeader(event, 'accept-language')
  if (!header)
    return DEFAULT_REDIRECT_LOCALE

  for (const code of parseAcceptLanguage(header)) {
    const locale = resolveLocaleCode(code)
    if (locale)
      return locale
  }

  return DEFAULT_REDIRECT_LOCALE
}
