import type { Topic } from './curriculumData';
import {
  getSubjectProgress,
  loadResourceEngagements,
  type SubjectProgress,
} from './resourceEngagement';
import { loadDoneItems } from './doneItems';

export type ProgressGroupId = 'AS' | 'A2' | 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'Overall';

const AS_A2_GROUPS: ProgressGroupId[] = ['AS', 'A2'];
const UNIT_GROUPS: ProgressGroupId[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6'];

type TopicResource = { id: string; url: string };

export function isRevisionTopic(topic: Topic): boolean {
  return topic.tags?.some((tag) => tag.name === 'Revision') ?? false;
}

/** Topics that count toward subject / group progress (excludes Revision). */
export function filterCountableTopics(topics: Topic[]): Topic[] {
  return topics.filter((topic) => !isRevisionTopic(topic));
}

function parseGroupFromTags(topic: Topic): ProgressGroupId | null {
  if (!topic.tags) return null;
  for (const tag of topic.tags) {
    if (tag.name === 'AS' || tag.name === 'A2') return tag.name;
    if (/^U[1-6]$/.test(tag.name)) return tag.name as ProgressGroupId;
  }
  return null;
}

function parseGroupFromGroupField(group: string): ProgressGroupId | null {
  const trimmed = group.trim();
  if (/^U[1-6]$/.test(trimmed)) return trimmed as ProgressGroupId;
  if (trimmed === 'AS' || trimmed === 'A2') return trimmed;
  if (/\(AS\)/.test(trimmed)) return 'AS';
  if (/\(A2\)/.test(trimmed)) return 'A2';
  return null;
}

/** Resolve which progress bucket a topic belongs to (from tags or group). */
export function getTopicProgressGroup(topic: Topic): ProgressGroupId | null {
  const fromTags = parseGroupFromTags(topic);
  if (fromTags) return fromTags;

  if (topic.group) {
    return parseGroupFromGroupField(topic.group);
  }

  return null;
}

export type ProgressScheme = 'as-a2' | 'units' | 'overall';

export function detectProgressScheme(topics: Topic[]): ProgressScheme {
  const countable = filterCountableTopics(topics);

  const hasASorA2 = countable.some((topic) => {
    const group = getTopicProgressGroup(topic);
    return group === 'AS' || group === 'A2';
  });
  if (hasASorA2) return 'as-a2';

  const hasUnits = countable.some((topic) => {
    const group = getTopicProgressGroup(topic);
    return group !== null && group.startsWith('U');
  });
  if (hasUnits) return 'units';

  return 'overall';
}

export type GroupProgress = {
  label: ProgressGroupId;
  progress: SubjectProgress;
};

export function getGroupedSubjectProgress(
  topics: Topic[],
  getResources: (topicId: string) => TopicResource[]
): GroupProgress[] {
  const countable = filterCountableTopics(topics);
  const doneResources = loadDoneItems('doneResources');
  const engagements = loadResourceEngagements();
  const scheme = detectProgressScheme(countable);

  if (scheme === 'overall') {
    const progress = getSubjectProgress(
      countable.map((topic) => topic.id),
      getResources,
      doneResources,
      engagements
    );
    if (progress.total === 0) return [];
    return [{ label: 'Overall', progress }];
  }

  const groupLabels = scheme === 'as-a2' ? AS_A2_GROUPS : UNIT_GROUPS;
  const results: GroupProgress[] = [];

  for (const label of groupLabels) {
    const groupTopicIds = countable
      .filter((topic) => getTopicProgressGroup(topic) === label)
      .map((topic) => topic.id);

    const progress = getSubjectProgress(
      groupTopicIds,
      getResources,
      doneResources,
      engagements
    );

    if (progress.total > 0) {
      results.push({ label, progress });
    }
  }

  return results;
}
