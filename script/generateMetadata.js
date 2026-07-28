import { writeFileSync } from 'fs';
import path from 'path';
import { generateTopicMetadata } from './metadata.js';
import { curriculumData } from '../src/utils/curriculumData.ts';

function generateMetadata() {
  try {
    const metadata = { topics: {} };

    // Process each curriculum level and board from curriculumData
    Object.entries(curriculumData).forEach(([level, curriculum]) => {
      const curriculumType = level === 'igcse' ? 'IGCSE' : 'A-Level';

      Object.entries(curriculum.boards || {}).forEach(([boardKey, boardData]) => {
        const topics = boardData?.topics || [];
        topics.forEach(topic => {
          const topicMeta = generateTopicMetadata({
            title: topic.title,
            subject: topic.subject,
            curriculum: curriculumType,
            board: boardKey,
            group: topic.group
          });

          // We don't have per-topic runtime fields here (videos/resources/quizzes)
          // so leave those flags as defaults (will be updated if another process adds them)

          metadata.topics[topicMeta.url] = topicMeta;
        });
      });
    });

    const outputPath = path.join(process.cwd(), 'public', 'metadata.json');
    writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

    console.log('Metadata generated and saved successfully!');
    console.log(`Topics processed: ${Object.keys(metadata.topics).length}`);
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
}

// Run the metadata generation
generateMetadata();