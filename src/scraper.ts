import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { enrichLead } from './enricher';
import type { Lead, ScraperOptions, ProgressCallback } from './types';

const USER_AGENTS: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function randomDelay(min = 1200, max = 2500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(text: string): string {
  return (text ?? '')
    .replace(/[\uE000-\uF8FF]/g, '') // strip Google Maps icon glyphs
    .replace(/\s+/g, ' ')
    .trim();
}

async function safeText(page: Page, selector: string): Promise<string> {
  try {
    const el = await page.$(selector);
    if (!el) return '';
    const text = await el.textContent();
    return cleanText(text ?? '');
  } catch {
    return '';
  }
}

async function safeAttr(page: Page, selector: string, attr: string): Promise<string> {
  try {
    const el = await page.$(selector);
    if (!el) return '';
    const val = await el.getAttribute(attr);
    return cleanText(val ?? '');
  } catch {
    return '';
  }
}

function unwrapGoogleRedirect(url: string): string {
  if (!url) return '';
  try {
    if (url.includes('/url?q=')) {
      const parsed = new URL(url.startsWith('http') ? url : `https://google.com${url}`);
      const target = parsed.searchParams.get('q');
      if (target) return target;
    }
  } catch {
    // return url as-is if unparseable
  }
  return url;
}

async function detectBlock(page: Page): Promise<boolean> {
  const url = page.url();
  if (url.includes('sorry/index') || url.includes('recaptcha') || url.includes('captcha')) {
    return true;
  }
  const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
  const blockPhrases = ['unusual traffic', 'captcha', 'automated queries', 'not a robot'];
  return blockPhrases.some((phrase) => bodyText.toLowerCase().includes(phrase));
}

async function handleCookieConsent(page: Page): Promise<void> {
  const consentSelectors = [
    'form[action*="consent"] button',
    'button[aria-label*="Accept all"]',
    'button[aria-label*="Accept"]',
    'button[aria-label*="Alle akzeptieren"]',
    'button[aria-label*="Tout accepter"]',
    'button:has-text("Accept all")',
    'button:has-text("I agree")',
  ];

  for (const sel of consentSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && (await btn.isVisible())) {
        await btn.click();
        await page.waitForTimeout(1000);
        break;
      }
    } catch {
      // Continue checking next selector
    }
  }
}

async function scrollFeedToLimit(page: Page, limit: number): Promise<void> {
  const feedSelector = 'div[role="feed"]';
  try {
    await page.waitForSelector(feedSelector, { timeout: 15000 });
  } catch {
    return;
  }

  let previousCount = 0;
  let stalledRounds = 0;

  while (stalledRounds < 4) {
    const currentCount = await page.$$eval(
      'a[href*="/maps/place/"], div[role="article"]',
      (els) => {
        const seen = new Set<string>();
        for (const el of els) {
          const href = el.getAttribute('href');
          if (href) seen.add(href);
        }
        return seen.size || els.length;
      }
    );

    if (currentCount >= limit) break;

    if (currentCount === previousCount) {
      stalledRounds++;
    } else {
      stalledRounds = 0;
    }

    previousCount = currentCount;

    // Scroll feed via DOM and dispatch mouse wheel
    await page.evaluate((sel) => {
      const feed = document.querySelector(sel);
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
        feed.dispatchEvent(new Event('scroll'));
      }
    }, feedSelector);

    // Also trigger mouse wheel within the feed container
    try {
      await page.hover(feedSelector);
      await page.mouse.wheel(0, 1500);
    } catch {
      // ignore hover errors
    }

    await randomDelay(900, 1800);

    // Check for "You've reached the end" notice
    const endText = await page.evaluate(() => {
      const endEl = document.querySelector('p.fontBodyMedium > span, div.PbZDve');
      return endEl?.textContent ?? '';
    });
    if (endText.toLowerCase().includes("you've reached the end")) break;
  }
}

async function extractDetailPane(page: Page): Promise<Partial<Lead>> {
  const result: Partial<Lead> = {};

  // Title
  result.title =
    (await safeText(page, 'h1.fontHeadlineLarge')) ||
    (await safeText(page, 'h1[data-attrid="title"]')) ||
    (await safeText(page, 'h1'));

  // Rating
  result.rating =
    (await safeText(page, 'div.fontDisplayLarge')) ||
    (await safeText(page, 'span[aria-label*="stars"]')) ||
    (await safeAttr(page, 'span[aria-label*="stars"]', 'aria-label'));

  if (result.rating) {
    const match = result.rating.match(/[\d.]+/);
    result.rating = match ? match[0] : result.rating;
  }

  // Reviews count
  const reviewsRaw =
    (await safeText(page, 'span[aria-label*="reviews"]')) ||
    (await safeAttr(page, 'span[aria-label*="reviews"]', 'aria-label')) ||
    (await safeText(page, 'div.F7nice button > span')) ||
    '';
  result.reviews = reviewsRaw.replace(/[^0-9]/g, '');

  // Category
  result.category =
    (await safeText(page, 'button.DkEaL')) ||
    (await safeText(page, 'span.DkEaL')) ||
    (await safeText(page, '[jsaction*="category"]')) ||
    '';

  // Address
  result.address =
    (await safeText(page, 'button[data-item-id="address"] div.fontBodyMedium')) ||
    (await safeText(page, '[data-item-id="address"]')) ||
    (await safeText(page, 'button[aria-label*="Address:"]')) ||
    '';

  // Phone
  result.phone =
    (await safeText(page, 'button[data-item-id^="phone"] div.fontBodyMedium')) ||
    (await safeText(page, '[data-tooltip="Copy phone number"] + div')) ||
    (await safeText(page, 'button[data-item-id^="phone"]')) ||
    (await safeText(page, 'button[aria-label*="Phone:"]')) ||
    '';

  // Website
  const rawWebsite =
    (await safeAttr(page, 'a[data-item-id="authority"]', 'href')) ||
    (await safeAttr(page, 'a[data-tooltip="Open website"]', 'href')) ||
    (await safeText(page, 'a[data-item-id="authority"]')) ||
    '';
  result.website = unwrapGoogleRedirect(rawWebsite);

  return result;
}

async function scrapeListingUrls(page: Page, limit: number): Promise<string[]> {
  const urls: string[] = [];
  const seen = new Set<string>();

  // Extract from feed link selectors
  const links = await page.$$('a.hfpxzc, a[href*="/maps/place/"]');
  for (const link of links) {
    if (urls.length >= limit) break;
    try {
      const href = await link.getAttribute('href');
      if (href && !seen.has(href)) {
        seen.add(href);
        urls.push(href);
      }
    } catch {
      // skip broken nodes
    }
  }

  return urls.slice(0, limit);
}

async function scrapeSingleListing(
  context: BrowserContext,
  url: string,
  enrich: boolean
): Promise<Lead | null> {
  const detailPage = await context.newPage();
  try {
    await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(800, 1600);

    if (await detectBlock(detailPage)) {
      await detailPage.close();
      throw new Error('captcha or blocked');
    }

    // Wait for the place title to render
    await detailPage.waitForSelector('h1', { timeout: 10000 }).catch(() => null);

    const partial = await extractDetailPane(detailPage);
    const mapsUrl = detailPage.url();

    if (!partial.title) {
      await detailPage.close();
      return null;
    }

    const lead: Lead = {
      title: partial.title ?? '',
      rating: partial.rating ?? '',
      reviews: partial.reviews ?? '',
      category: partial.category ?? '',
      phone: partial.phone ?? '',
      website: partial.website ?? '',
      address: partial.address ?? '',
      mapsUrl,
    };

    if (enrich && lead.website) {
      try {
        const enriched = await enrichLead(lead.website);
        lead.email = enriched.email;
        lead.socials = enriched.socials;
      } catch {
        lead.email = '';
        lead.socials = {};
      }
    }

    await detailPage.close();
    return lead;
  } catch (err: any) {
    await detailPage.close().catch(() => null);
    if (
      err?.message?.toLowerCase().includes('captcha') ||
      err?.message?.toLowerCase().includes('blocked')
    ) {
      throw err;
    }
    return null;
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function runScraper(
  options: ScraperOptions,
  onProgress: ProgressCallback
): Promise<Lead[]> {
  const { query, limit, headless, concurrency, enrich } = options;

  const browser: Browser = await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,800',
      '--disable-dev-shm-usage',
    ],
  });

  const context: BrowserContext = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  // Mask navigator.webdriver
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    (window as any).chrome = { runtime: {} };
  });

  const searchPage = await context.newPage();

  try {
    const encodedQuery = encodeURIComponent(query);
    const mapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

    // Use domcontentloaded for fast and reliable navigation
    await searchPage.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await randomDelay(1200, 2000);

    if (await detectBlock(searchPage)) {
      await browser.close();
      throw new Error('captcha or blocked — Google detected automated activity');
    }

    await handleCookieConsent(searchPage);

    // Check if Google Maps redirected directly to a single business listing
    if (searchPage.url().includes('/maps/place/')) {
      onProgress('Extracting lead details...', 0);
      await searchPage.waitForSelector('h1', { timeout: 10000 }).catch(() => null);
      const partial = await extractDetailPane(searchPage);

      if (partial.title) {
        const lead: Lead = {
          title: partial.title,
          rating: partial.rating ?? '',
          reviews: partial.reviews ?? '',
          category: partial.category ?? '',
          phone: partial.phone ?? '',
          website: partial.website ?? '',
          address: partial.address ?? '',
          mapsUrl: searchPage.url(),
        };

        if (enrich && lead.website) {
          try {
            const enriched = await enrichLead(lead.website);
            lead.email = enriched.email;
            lead.socials = enriched.socials;
          } catch {
            lead.email = '';
            lead.socials = {};
          }
        }

        await browser.close();
        onProgress('Extracting lead details...', 1);
        return [lead];
      }
    }

    onProgress('Scrolling feed to collect listings...', 0);
    await scrollFeedToLimit(searchPage, limit);
    await randomDelay(600, 1200);

    const listingUrls = await scrapeListingUrls(searchPage, limit);
    await searchPage.close();

    if (listingUrls.length === 0) {
      await browser.close();
      return [];
    }

    const leads: Lead[] = [];
    const chunks = chunkArray(listingUrls, concurrency);

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map((url) => scrapeSingleListing(context, url, enrich))
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          leads.push(result.value);
          onProgress('Extracting lead details...', leads.length);
        } else if (result.status === 'rejected') {
          const msg: string = result.reason?.message ?? '';
          if (msg.includes('captcha') || msg.includes('blocked')) {
            await browser.close();
            throw new Error('captcha or blocked — Google detected automated activity');
          }
        }
      }

      if (leads.length < listingUrls.length) {
        await randomDelay(800, 1600);
      }
    }

    await browser.close();
    return leads;
  } catch (err) {
    await browser.close().catch(() => null);
    throw err;
  }
}
