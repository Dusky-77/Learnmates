import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4173;

function getRoutesFromSitemap() {
  const xml = readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map(m => new URL(m[1]).pathname);
}

function routeToFilePath(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, route, 'index.html');
}

async function prerender() {
  const routes = getRoutesFromSitemap();
  console.log(`Prerendering ${routes.length} routes (head-only mode)...`);

  // capture the pristine build output ONCE, before any route file gets overwritten
  const template = readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const bodyMatch = template.match(/<body[^>]*>[\s\S]*<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[0] : '<body><div id="root"></div></body>';
  const htmlOpenMatch = template.match(/<html[^>]*>/i);
  const htmlOpenTag = htmlOpenMatch ? htmlOpenMatch[0] : '<html lang="en">';

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let succeeded = 0;
  let failed = 0;

for (const route of routes) {
  try {
    const page = await browser.newPage();
    const pageUrl = `http://localhost:${PORT}${route}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    const headHtml = await page.evaluate(() => document.head.innerHTML);
    await page.close();

    const finalHtml = `<!DOCTYPE html>${htmlOpenTag}<head>${headHtml}</head>${bodyHtml}</html>`;

    const filePath = routeToFilePath(route);
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, finalHtml);

    succeeded++;
  } catch (err) {
    console.warn(`Failed to prerender ${route}:`, err.message);
    failed++;
  }
}

  await browser.close();
  console.log(`Prerendering complete: ${succeeded} succeeded, ${failed} failed.`);
}

prerender();