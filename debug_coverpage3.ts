import { topicalConfigs } from './src/pages/topicalpagesdata';
import { SubjectConfig } from './src/utils/topicalConfig';

const buildTopicsStructure = (
  selectedTopics: Set<string>,
  levelBoardSubject: { level: string; board: string; subject: string }
) => {
  interface TopicStructure {
    [unit: string]: { [mainTopic: string]: string[] };
  }
  const topicsStructure: TopicStructure = {};
  let totalTopicCount = 0;

  const cfg = topicalConfigs.find(
    c =>
      c.level.toLowerCase() === levelBoardSubject.level.toLowerCase() &&
      c.board.toLowerCase() === levelBoardSubject.board.toLowerCase() &&
      c.subject.toLowerCase() === levelBoardSubject.subject.toLowerCase()
  );

  Array.from(selectedTopics).forEach(key => {
    if (typeof key !== 'string') return;
    const parts = key.split('||');
    if (parts.length < 5) return;

    const [level, board, subject, unit, ...nameParts] = parts;
    const name = nameParts.join('||');
    
    if (
      level.toLowerCase() !== levelBoardSubject.level.toLowerCase() ||
      board.toLowerCase() !== levelBoardSubject.board.toLowerCase() ||
      subject.toLowerCase() !== levelBoardSubject.subject.toLowerCase()
    ) {
      return;
    }

    const unitObj = cfg?.units.find(u => u.unit.toLowerCase() === unit.toLowerCase());
    if (!unitObj) {
      console.log("UNIT NOT FOUND", unit);
      return;
    }

    if (!topicsStructure[unitObj.unit]) topicsStructure[unitObj.unit] = {};

    const topicObj = unitObj.topics.find(t => t.topic.toLowerCase() === name.toLowerCase());
    if (topicObj) {
      if (!topicObj.subtopics || topicObj.subtopics.length === 0) {
        if (!topicsStructure[unitObj.unit][topicObj.topic]) {
          topicsStructure[unitObj.unit][topicObj.topic] = [];
          totalTopicCount++;
        }
      }
      return;
    }

    const parent = unitObj.topics.find(t => t.subtopics?.some(st => st.subtopic.toLowerCase() === name.toLowerCase()));
    if (!parent) {
      console.log("PARENT NOT FOUND FOR", name);
      return;
    }

    const exactSubtopic = parent.subtopics?.find(st => st.subtopic.toLowerCase() === name.toLowerCase())?.subtopic || name;

    if (!topicsStructure[unitObj.unit][parent.topic]) topicsStructure[unitObj.unit][parent.topic] = [];
    if (!topicsStructure[unitObj.unit][parent.topic].includes(exactSubtopic)) {
      topicsStructure[unitObj.unit][parent.topic].push(exactSubtopic);
      totalTopicCount++;
    }
  });

  return { topicsStructure, totalTopicCount };
};

const igcseCambridgePhysics = topicalConfigs.find(c => c.level === 'igcse' && c.board === 'cambridge' && c.subject === 'Physics');
const unit = igcseCambridgePhysics.units[0];
const mainTopic = unit.topics[0];
const subtopic = mainTopic.subtopics[0];

console.log("Testing with:", subtopic.subtopic);

const topics = new Set([
  `igcse||cambridge||physics||${unit.unit}||${subtopic.subtopic}`
]);
const res = buildTopicsStructure(topics, { level: "igcse", board: "cambridge", subject: "physics" });
console.log(JSON.stringify(res, null, 2));

