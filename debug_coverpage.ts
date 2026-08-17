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

  console.log("Found cfg:", !!cfg);

  Array.from(selectedTopics).forEach(key => {
    if (typeof key !== 'string') return;
    const parts = key.split('||');
    if (parts.length < 5) {
      console.log("Parts < 5:", key);
      return;
    }

    const [level, board, subject, unit, ...nameParts] = parts;
    const name = nameParts.join('||');
    
    if (
      level.toLowerCase() !== levelBoardSubject.level.toLowerCase() ||
      board.toLowerCase() !== levelBoardSubject.board.toLowerCase() ||
      subject.toLowerCase() !== levelBoardSubject.subject.toLowerCase()
    ) {
      console.log("Mismatch level/board/subject", level, board, subject);
      return;
    }

    const unitObj = cfg?.units.find(u => u.unit === unit);
    if (!unitObj) {
      console.log("Unit not found:", unit);
      return;
    }

    if (!topicsStructure[unit]) topicsStructure[unit] = {};

    const topicObj = unitObj.topics.find(t => t.topic === name);
    if (topicObj) {
      if (!topicObj.subtopics || topicObj.subtopics.length === 0) {
        if (!topicsStructure[unit][name]) {
          topicsStructure[unit][name] = [];
          totalTopicCount++;
        }
      } else {
          console.log("Topic has subtopics, ignoring:", name);
      }
      return;
    }

    const parent = unitObj.topics.find(t => t.subtopics?.some(st => st.subtopic === name));
    if (!parent) {
      console.log("Parent not found for subtopic:", name);
      return;
    }

    if (!topicsStructure[unit][parent.topic]) topicsStructure[unit][parent.topic] = [];
    if (!topicsStructure[unit][parent.topic].includes(name)) {
      topicsStructure[unit][parent.topic].push(name);
      totalTopicCount++;
    }
  });

  return { topicsStructure, totalTopicCount };
};

const topics = new Set([
  "igcse||cambridge||physics||Unit 1||Forces"
]);
const res = buildTopicsStructure(topics, { level: "igcse", board: "cambridge", subject: "physics" });
console.log(JSON.stringify(res, null, 2));

