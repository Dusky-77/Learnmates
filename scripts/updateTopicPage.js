#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const topicPagePath = path.join(__dirname, '../src/pages/TopicPage.tsx');
let content = fs.readFileSync(topicPagePath, 'utf-8');

// 1. Add import after Quiz import
const importRegex = /import Quiz from '..\/components\/Quiz';/;
const newImport = `import Quiz from '../components/Quiz';
import { loadMultipleQuizzes, Quiz as QuizType } from '../utils/quizLoader';`;

content = content.replace(importRegex, newImport);

// 2. Update the quizzes line and add state for loaded quizzes
// Find the section where doneResources state is set and add loadedQuizzes after it
const doneResourcesStateRegex = /const \[doneResources, setDoneResources\] = useState<string\[\]>\(\(\) => \{[\s\S]*?\}\);\s*useEffect\(\(\) => \{\s*localStorage\.setItem\('doneResources', JSON\.stringify\(doneResources\)\);\s*\}, \[doneResources\]\);/;

const newQuizStates = `const [loadedQuizzes, setLoadedQuizzes] = useState<QuizType[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);`;

// Find the exact location to insert
const doneResourcesMatch = content.match(/const \[doneResources[\s\S]*?\}, \[doneResources\]\);/);
if (doneResourcesMatch) {
  const insertPoint = content.indexOf(doneResourcesMatch[0]) + doneResourcesMatch[0].length;
  content = content.slice(0, insertPoint) + '\n\n  ' + newQuizStates + content.slice(insertPoint);
}

// 3. Replace the old quizzes assignment with new one
const oldQuizzesRegex = /const quizzes = topic\?\.quizzes \|\| \[\];/;
const newQuizzesCode = `// Load quizzes dynamically when topic changes
  useEffect(() => {
    if (!topic?.quizConfig || topic.quizConfig.length === 0) {
      setLoadedQuizzes([]);
      return;
    }

    setLoadingQuizzes(true);
    loadMultipleQuizzes(topic.quizConfig)
      .then(quizzes => {
        setLoadedQuizzes(quizzes);
        setLoadingQuizzes(false);
      })
      .catch(error => {
        console.error('Failed to load quizzes:', error);
        setLoadedQuizzes([]);
        setLoadingQuizzes(false);
      });
  }, [topic?.quizConfig]);

  const quizzes = loadedQuizzes;`;

content = content.replace(oldQuizzesRegex, newQuizzesCode);

fs.writeFileSync(topicPagePath, content, 'utf-8');
console.log('✅ TopicPage.tsx updated with quiz loader!');
