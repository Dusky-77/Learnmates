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
  
  if (!cfg) console.log("NO CFG!");

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

    const unitObj = cfg?.units.find(u => u.unit === unit);
    if (!unitObj) return;

    if (!topicsStructure[unit]) topicsStructure[unit] = {};

    // The key names a major topic directly.
    const topicObj = unitObj.topics.find(t => t.topic === name);
    if (topicObj) {
      if (!topicObj.subtopics || topicObj.subtopics.length === 0) {
        if (!topicsStructure[unit][name]) {
          topicsStructure[unit][name] = [];
          totalTopicCount++;
        }
      }
      return;
    }

    // Otherwise the key must be a subtopic — find its parent topic.
    const parent = unitObj.topics.find(t => t.subtopics?.some(st => st.subtopic === name));
    if (!parent) return;

    if (!topicsStructure[unit][parent.topic]) topicsStructure[unit][parent.topic] = [];
    if (!topicsStructure[unit][parent.topic].includes(name)) {
      topicsStructure[unit][parent.topic].push(name);
      totalTopicCount++;
    }
  });

  return { topicsStructure, totalTopicCount };
};

const topics = new Set([
  "igcse||cambridge||Physics||Physics||1.2 Kinematics"
]);
const res = buildTopicsStructure(topics, { level: "igcse", board: "cambridge", subject: "physics" });
console.log(JSON.stringify(res, null, 2));

