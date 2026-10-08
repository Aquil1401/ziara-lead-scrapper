import * as cheerio from 'cheerio';
import type { SocialHandles } from './types';

const TIMEOUT_MS = 10000;

// Non-global regex for testing/validating individual email strings
const EMAIL_VALIDATE_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
// Global regex for scanning raw text
const EMAIL_SCAN_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const ASSET_EXTENSIONS = /\.(png|jpe?g|svg|gif|webp|avif|ico|bmp|tiff|woff2?|ttf|eot|js|css|map)$/i;

const IGNORED_SOCIAL_PATHS = [
  '/tr',
  '/sharer',
  '/share',
  '/intent',
  '/dialog',
  '/plugins',
  '/widgets',
  '/hashtag',
  '/privacy',
  '/terms',
  '/policies',
  '/login',
  '/signup',
  '/settings',
  '/v2.',
];

export interface EnrichResult {
  email: string;
  socials: SocialHandles;
}

function normaliseUrl(raw: string): string {
  try {
    const trimmed = raw.trim();
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return u.href;
  } catch {
    return raw.trim();
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const targetUrl = normaliseUrl(url);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) return '';
    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeEmail(candidate: string): string {
  return candidate
    .trim()
    .replace(/^[.<>"'\s]+|[.<>"'\s]+$/g, '')
    .toLowerCase();
}

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 80) return false;
  if (!EMAIL_VALIDATE_REGEX.test(email)) return false;
  if (ASSET_EXTENSIONS.test(email)) return false;

  const lower = email.toLowerCase();
  const blacklistedSubstrings = [
    'sentry',
    'example',
    'noreply',
    'no-reply',
    'placeholder',
    'domain.',
    'yourcompany',
    'wixpress',
    'webpack',
    'bootstrap',
  ];

  if (blacklistedSubstrings.some((kw) => lower.includes(kw))) return false;
  if (lower.startsWith('user@') || lower.startsWith('email@') || lower.startsWith('test@')) return false;

  return true;
}

function extractEmails(html: string, $: cheerio.CheerioAPI): string {
  // 1. mailto: links (most reliable)
  const mailtoEmails: string[] = [];
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const rawEmail = href.replace(/^mailto:/i, '').split('?')[0];
    const cleaned = sanitizeEmail(rawEmail);
    if (isValidEmail(cleaned)) {
      mailtoEmails.push(cleaned);
    }
  });

  if (mailtoEmails.length > 0) {
    return mailtoEmails[0];
  }

  // 2. Regex scan across text content and raw HTML
  const textMatches = html.match(EMAIL_SCAN_REGEX) ?? [];
  for (const raw of textMatches) {
    const cleaned = sanitizeEmail(raw);
    if (isValidEmail(cleaned)) {
      return cleaned;
    }
  }

  return '';
}

function isSocialCandidateValid(url: string): boolean {
  const lower = url.toLowerCase();
  for (const ignored of IGNORED_SOCIAL_PATHS) {
    if (lower.includes(ignored)) return false;
  }
  return true;
}

function cleanSocialUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    // Keep protocol, host, and pathname, strip query params and hash
    let path = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch {
    return url.split('?')[0].replace(/[)"'>\s]+$/, '');
  }
}

function extractSocials(html: string, $: cheerio.CheerioAPI): SocialHandles {
  const socials: SocialHandles = {};

  const patterns: Record<keyof SocialHandles, RegExp> = {
    linkedin: /https?:\/\/(www\.)?linkedin\.com\/(company|in|school)\/[^\s"'<>?#]+/i,
    twitter: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,50}/i,
    instagram: /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.-]{1,50}/i,
    facebook: /https?:\/\/(www\.)?facebook\.com\/(?:pages\/[^\s"'<>?#]+\/\d+|[a-zA-Z0-9_.-]{2,50})/i,
  };

  // 1. Scan anchor tags first (highest precision)
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (!href) return;

    for (const [platform, pattern] of Object.entries(patterns) as [keyof SocialHandles, RegExp][]) {
      if (!socials[platform] && pattern.test(href) && isSocialCandidateValid(href)) {
        socials[platform] = cleanSocialUrl(href);
      }
    }
  });

  // 2. Fallback to raw HTML regex for any uncaptured platforms
  for (const [platform, pattern] of Object.entries(patterns) as [keyof SocialHandles, RegExp][]) {
    if (!socials[platform]) {
      const match = html.match(pattern);
      if (match && isSocialCandidateValid(match[0])) {
        socials[platform] = cleanSocialUrl(match[0]);
      }
    }
  }

  return socials;
}

function extractFromStructuredData($: cheerio.CheerioAPI): Partial<EnrichResult> {
  const result: Partial<EnrichResult> = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const entries = Array.isArray(data) ? data : [data];

      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;

        if (entry.email && !result.email) {
          const cleaned = sanitizeEmail(String(entry.email));
          if (isValidEmail(cleaned)) {
            result.email = cleaned;
          }
        }

        const sameAsList: string[] = [];
        if (typeof entry.sameAs === 'string') sameAsList.push(entry.sameAs);
        if (Array.isArray(entry.sameAs)) sameAsList.push(...entry.sameAs);

        if (sameAsList.length > 0) {
          if (!result.socials) result.socials = {};
          for (const url of sameAsList) {
            if (typeof url !== 'string' || !isSocialCandidateValid(url)) continue;
            if (/linkedin\.com/i.test(url) && !result.socials.linkedin) {
              result.socials.linkedin = cleanSocialUrl(url);
            } else if (/(twitter\.com|x\.com)/i.test(url) && !result.socials.twitter) {
              result.socials.twitter = cleanSocialUrl(url);
            } else if (/instagram\.com/i.test(url) && !result.socials.instagram) {
              result.socials.instagram = cleanSocialUrl(url);
            } else if (/facebook\.com/i.test(url) && !result.socials.facebook) {
              result.socials.facebook = cleanSocialUrl(url);
            }
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  });

  return result;
}

export async function enrichLead(websiteUrl: string): Promise<EnrichResult> {
  const empty: EnrichResult = { email: '', socials: {} };
  if (!websiteUrl) return empty;

  const html = await fetchHtml(websiteUrl);
  if (!html) return empty;

  const $ = cheerio.load(html);

  // Try structured data first
  const structured = extractFromStructuredData($);

  const email = structured.email || extractEmails(html, $);
  const socials: SocialHandles = {
    ...extractSocials(html, $),
    ...(structured.socials ?? {}),
  };

  // If email not found on homepage, check common contact/about pages
  if (!email) {
    const contactUrls: string[] = [];
    const baseOrigin = new URL(normaliseUrl(websiteUrl)).origin;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const text = ($(el).text() ?? '').toLowerCase();
      const hrefLower = href.toLowerCase();

      if (
        text.includes('contact') ||
        hrefLower.includes('contact') ||
        text.includes('about') ||
        hrefLower.includes('about')
      ) {
        try {
          const absolute = new URL(href, normaliseUrl(websiteUrl)).href;
          if (absolute.startsWith(baseOrigin) && !contactUrls.includes(absolute)) {
            contactUrls.push(absolute);
          }
        } catch {
          // ignore invalid URLs
        }
      }
    });

    for (const contactUrl of contactUrls.slice(0, 2)) {
      const contactHtml = await fetchHtml(contactUrl);
      if (contactHtml) {
        const $contact = cheerio.load(contactHtml);
        const contactEmail = extractEmails(contactHtml, $contact);
        if (contactEmail) {
          return { email: contactEmail, socials };
        }
      }
    }
  }

  return { email, socials };
}
