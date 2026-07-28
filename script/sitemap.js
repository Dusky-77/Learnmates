import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { curriculumData } from '../src/utils/curriculumData.ts';
import { topicData } from '../src/data/topicData.ts';
import { buildPdfViewerPath } from '../src/utils/pdfViewerPaths.ts';
import { getTopicSlug } from '../src/utils/curriculumData.ts';

const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(url) && !url.includes('drive.google.com');


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = 'https://www.learnmates.org';

const baseRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/curriculum', changefreq: 'weekly', priority: 0.9 },
  { url: '/donate', changefreq: 'monthly', priority: 0.7 },
  { url: '/contribute', changefreq: 'monthly', priority: 0.7 },
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.5 }
];

function getTopicRoutes() {
  const metadataPath = path.join(process.cwd(), 'public', 'metadata.json');
  let topicRoutes = [];
  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    Object.values(metadata.topics).forEach(topic => {
      topicRoutes.push({ url: topic.url, changefreq: 'weekly', priority: 0.8 });
    });
  } catch (err) {
    console.warn('Warning: Error reading metadata file', err);
  }
  return topicRoutes;
}

// NEW: walk every topic's resources and build a PDF viewer route per PDF
function getResourceRoutes() {
  const resourceRoutes = [];

  Object.entries(curriculumData).forEach(([level, curriculum]) => {
    const type = level === 'igcse' ? 'igcse' : 'a-level';

    Object.entries(curriculum.boards || {}).forEach(([boardKey, boardData]) => {
      (boardData?.topics || []).forEach(topic => {
        const fullTopic = topic.id ? topicData[topic.id] : null;
        const resources = fullTopic?.resources || [];

        // use the same slug builder the live routes use — title + group, e.g. "microbiology-immunity-and-forensics-(u4)"
        const topicSlug = getTopicSlug({ title: topic.title, group: topic.group });

        resources.forEach(resource => {
          if (!isPdfUrl(resource.url)) return; // excludes Google Drive links, same rule as resolvePdfResource

          const url = buildPdfViewerPath(
            { type, board: boardKey, subject: topic.subject, topicSlug },
            resource.url
          );

          resourceRoutes.push({ url, changefreq: 'monthly', priority: 0.6 });
        });
      });
    });
  });
  console.log('Resource routes:', resourceRoutes.length);
  return resourceRoutes;
}

async function generateSitemap() {
  try {
    const sitemap = new SitemapStream({ hostname: baseUrl });
    const writeStream = createWriteStream(path.join(__dirname, '../public/sitemap.xml'));
    sitemap.pipe(writeStream);

    const allRoutes = [...baseRoutes, ...getTopicRoutes(), ...getResourceRoutes()];

    allRoutes.forEach(route => {
      sitemap.write({
        url: route.url,
        changefreq: route.changefreq,
        priority: route.priority,
        lastmod: new Date().toISOString().split('T')[0]
      });
    });

    sitemap.end();
    await streamToPromise(sitemap);
    console.log('Sitemap generated successfully!');
    console.log(`Total routes: ${allRoutes.length}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();