import { getTopicSlug } from './curriculumData';
import { getPdfFileSlug } from './pdfViewerPaths';

export type TopicResource = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export type ResolvedTopic = {
  key: string;
  title: string;
  subject: string;
  description?: string;
  resources: TopicResource[];
  group?: string;
};

const isPdfUrl = (url: string) => /\.pdf(\?|$)/i.test(url) && !url.includes('drive.google.com');

export function resolveTopicKeyFromParams(
  topicData: Record<string, ResolvedTopic & Record<string, unknown>>,
  titleParam?: string,
  subjectParam?: string
): string | undefined {
  const slug = titleParam ? decodeURIComponent(titleParam) : '';
  if (!slug) return undefined;

  if ((topicData as Record<string, unknown>)[slug]) {
    return slug;
  }

  const decodedSubject = subjectParam ? decodeURIComponent(subjectParam).toLowerCase() : null;

  return Object.keys(topicData).find((key) => {
    const topic = topicData[key];
    if (!topic?.title) return false;
    if (decodedSubject && topic.subject && String(topic.subject).toLowerCase() !== decodedSubject) {
      return false;
    }
    return getTopicSlug({ title: topic.title, group: topic.group }) === slug;
  });
}

export function resolvePdfResource(
  topic: ResolvedTopic,
  pdfFileParam: string
): TopicResource | null {
  const target = decodeURIComponent(pdfFileParam).toLowerCase();

  for (const resource of topic.resources) {
    if (!isPdfUrl(resource.url)) continue;

    const slug = getPdfFileSlug(resource.url).toLowerCase();
    const rawName = decodeURIComponent(resource.url.split('/').pop() || '').toLowerCase();

    if (slug === target || rawName === target) {
      return resource;
    }
  }

  return null;
}
