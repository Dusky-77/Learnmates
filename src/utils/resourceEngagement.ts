import { DoneItem, isDoneItem, loadDoneItems } from './doneItems';

export const ENGAGEMENT_STORAGE_KEY = 'resourceEngagement';
export const ENGAGEMENT_UPDATED_EVENT = 'resource-engagement-updated';

export const ENGAGEMENT_POINTS = {
  downloaded: 2,
  manualDone: 1,
  opened: 1,
  meaningfulRead: 2,
} as const;

export const TOPIC_COMPLETION_THRESHOLD = 2;

export type EngagementFlag = 'downloaded' | 'opened' | 'meaningfulRead';

export type ResourceEngagement = {
  topicId: string;
  resourceId: string;
  url: string;
  downloaded: boolean;
  opened: boolean;
  meaningfulRead: boolean;
};

type TopicResource = { id: string; url: string };

function engagementKey(topicId: string, resourceId: string, url: string): string {
  return `${topicId}|${resourceId}|${url}`;
}

export function notifyEngagementUpdated(): void {
  window.dispatchEvent(new CustomEvent(ENGAGEMENT_UPDATED_EVENT));
}

export function loadResourceEngagements(): ResourceEngagement[] {
  try {
    const saved = localStorage.getItem(ENGAGEMENT_STORAGE_KEY);
    if (!saved) return [];
    const raw = JSON.parse(saved);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const topicId = 'topicId' in item ? String(item.topicId) : '';
        const resourceId = 'resourceId' in item ? String(item.resourceId) : '';
        const url = 'url' in item ? String(item.url) : '';
        if (!topicId || !resourceId || !url) return null;
        return {
          topicId,
          resourceId,
          url,
          downloaded: Boolean(item.downloaded),
          opened: Boolean(item.opened),
          meaningfulRead: Boolean(item.meaningfulRead),
        } satisfies ResourceEngagement;
      })
      .filter((item): item is ResourceEngagement => item !== null);
  } catch {
    return [];
  }
}

function saveResourceEngagements(items: ResourceEngagement[]): void {
  localStorage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(items));
  notifyEngagementUpdated();
}

export function getResourceEngagement(
  topicId: string,
  resourceId: string,
  url: string,
  items: ResourceEngagement[] = loadResourceEngagements()
): ResourceEngagement | null {
  const key = engagementKey(topicId, resourceId, url);
  return items.find((item) => engagementKey(item.topicId, item.resourceId, item.url) === key) ?? null;
}

export function setEngagementFlag(
  topicId: string,
  resourceId: string,
  url: string,
  flag: EngagementFlag
): void {
  const items = loadResourceEngagements();
  const key = engagementKey(topicId, resourceId, url);
  const index = items.findIndex((item) => engagementKey(item.topicId, item.resourceId, item.url) === key);

  if (index >= 0) {
    if (items[index][flag]) return;
    items[index] = { ...items[index], [flag]: true };
  } else {
    items.push({
      topicId,
      resourceId,
      url,
      downloaded: flag === 'downloaded',
      opened: flag === 'opened',
      meaningfulRead: flag === 'meaningfulRead',
    });
  }

  saveResourceEngagements(items);
}

export function getResourcePoints(
  topicId: string,
  resource: TopicResource,
  doneResources: DoneItem[] = loadDoneItems('doneResources'),
  engagements: ResourceEngagement[] = loadResourceEngagements()
): number {
  const engagement = getResourceEngagement(topicId, resource.id, resource.url, engagements);
  const manualDone = isDoneItem(doneResources, resource.id, resource.url);

  return (
    (engagement?.downloaded ? ENGAGEMENT_POINTS.downloaded : 0) +
    (manualDone ? ENGAGEMENT_POINTS.manualDone : 0) +
    (engagement?.opened ? ENGAGEMENT_POINTS.opened : 0) +
    (engagement?.meaningfulRead ? ENGAGEMENT_POINTS.meaningfulRead : 0)
  );
}

/** A topic is complete when any single resource reaches the point threshold. */
export function isTopicComplete(
  topicId: string,
  resources: TopicResource[],
  doneResources: DoneItem[] = loadDoneItems('doneResources'),
  engagements: ResourceEngagement[] = loadResourceEngagements()
): boolean {
  if (resources.length === 0) return false;
  return resources.some(
    (resource) => getResourcePoints(topicId, resource, doneResources, engagements) >= TOPIC_COMPLETION_THRESHOLD
  );
}

export type SubjectProgress = {
  completed: number;
  total: number;
  percent: number;
};

export function getSubjectProgress(
  topicIds: string[],
  getResources: (topicId: string) => TopicResource[],
  doneResources: DoneItem[] = loadDoneItems('doneResources'),
  engagements: ResourceEngagement[] = loadResourceEngagements()
): SubjectProgress {
  const eligible = topicIds.filter((id) => getResources(id).length > 0);
  const completed = eligible.filter((id) =>
    isTopicComplete(id, getResources(id), doneResources, engagements)
  ).length;
  const total = eligible.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
