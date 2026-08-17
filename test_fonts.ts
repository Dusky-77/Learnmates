import { PDFDocument, StandardFonts } from 'pdf-lib';
import { topicalConfigs } from './src/pages/topicalpagesdata';

async function testAllTopics() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  let failed = 0;
  
  for (const cfg of topicalConfigs) {
    for (const unit of cfg.units) {
      for (const topic of unit.topics) {
        try {
          font.widthOfTextAtSize(topic.topic, 10);
        } catch (e) {
          console.error(`Font error on topic: "${topic.topic}"`, e.message);
          failed++;
        }
        
        if (topic.subtopics) {
          for (const sub of topic.subtopics) {
            try {
              font.widthOfTextAtSize(sub.subtopic, 10);
            } catch (e) {
              console.error(`Font error on subtopic: "${sub.subtopic}"`, e.message);
              failed++;
            }
          }
        }
      }
    }
  }
  
  console.log(`Total failed strings: ${failed}`);
}

testAllTopics();
