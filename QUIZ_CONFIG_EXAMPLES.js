/**
 * QUIZ CONFIGURATION EXAMPLES
 * 
 * Copy-paste these into your TopicPage.tsx to add dynamic quiz loading
 * to different topics and subjects.
 */

// ============================================================================
// BIOLOGY - IGCSE CAMBRIDGE
// ============================================================================

'biology-1': {
  title: 'Characteristics and Classifications of living organisms',
  subject: 'Biology',
  curriculum: 'igcse',
  description: 'Explore the characteristics and classifications of living organisms...',
  videos: [],
  resources: [{ id: 'r1', title: 'Characteristics and Classifications Notes', url: '/documents/igcse/cambridge/Biology/Chapter 1.pdf' }],
  quizConfig: [
    { folderPath: '/Questions/igcse/cambridge/biology', title: 'Practice Questions' }
  ]
},

'biology-2': {
  title: 'Organisation of the organism',
  subject: 'Biology',
  curriculum: 'igcse',
  description: 'Explore the organization of cells, tissues, organs, and systems...',
  videos: [],
  resources: [{ id: 'r1', title: 'Organisation of the Organism Notes', url: '/documents/igcse/cambridge/Biology/Chapter 2.pdf' }],
  quizConfig: [   { folderPath: '/Questions/igcse/cambridge/biology', title: 'Practice Questions' }
  ]
},

// Already updated with quizConfig:
// 'biology-3' has quizConfig ✓

// ============================================================================
// CHEMISTRY - IGCSE CAMBRIDGE
// ============================================================================

'chemistry-4': {
  title: 'Electrochemistry',
  subject: 'Chemistry',
  curriculum: 'igcse',
  description: 'Explore the principles of electrochemistry...',
  videos: [],
  resources: [{ id: 'r1', title: 'Electrochemistry Notes(@PISANG)', url: 'https://...' }],
  quizConfig: [
    { folderPath: '/Questions/igcse/cambridge/chemistry', title: 'Questions' }
  ]
},

// ============================================================================
// CHEMISTRY - A-LEVEL CAMBRIDGE
// ============================================================================

'chemistry-T1': {
  title: 'Formulae, Equations and Amount of Substance (U1)',
  subject: 'Chemistry',
  curriculum: 'A-Level',
  description: 'Understand chemical formulae, writing and balancing equations...',
  videos: [],
  resources: [{ id: 'r1', title: 'Self-Study booklet(@Aeth_en)', url: '/documents/...' }],
  quizConfig: [
    { folderPath: '/Questions/alevel/cambridge/chemistry/T1', title: 'Exam Questions' }
  ]
},

'chemistry-T4': {
  title: 'Introductory Organic Chemistry and Alkanes (U1)',
  subject: 'Chemistry',
  curriculum: 'A-Level',
  description: 'Introduction to organic nomenclature...',
  videos: [],
  resources: [{ id: 'r1', title: 'Self-Study booklet(@Aeth_en)', url: '/documents/...' }],
  quizConfig: [
    {
      folderPath: '/Questions/alevel/cambridge/chemistry/T4-basic',
      title: 'Basic Questions'
    },
    {
      folderPath: '/Questions/alevel/cambridge/chemistry/T4-advanced',
      title: 'Challenge Questions'
    }
  ]
},

// ============================================================================
// PHYSICS - A-LEVEL CAMBRIDGE
// ============================================================================

'Physics-T1': {
  title: 'Mechanics (U1)',
  subject: 'Physics',
  curriculum: 'A-Level',
  description: 'Explore the principles of mechanics...',
  videos: [],
  resources: [{ id: 'r1', title: 'Mechanics Self-Study booklet(@Aeth_en)', url: '/documents/...' }],
  quizConfig: [
    { folderPath: '/Questions/alevel/cambridge/physics/mechanics', title: 'Mechanics Problems' }
  ]
},

'Physics-T5': {
  title: 'Further Mechanics (U4)',
  subject: 'Physics',
  curriculum: 'A-Level',
  description: 'Understand advanced mechanics concepts...',
  videos: [],
  resources: [{ id: 'r1', title: 'Further Mechanics Self-Study booklet(@Aeth_en)', url: '/documents/...' }],
  quizConfig: [
    { folderPath: '/Questions/alevel/cambridge/physics/further-mechanics', title: 'Questions' }
  ]
},

// ============================================================================
// HOW TO ADD MORE
// ============================================================================

/**
 * Pattern:
 * 
 * 'topic-id': {
 *   // ... existing fields: title, subject, curriculum, description, videos, resources
 *   quizConfig: [
 *     {
 *       folderPath: '/Questions/CURRICULUM/BOARD/SUBJECT/TOPIC',
 *       title: 'Display Name'
 *     }
 *   ]
 * }
 */

// ============================================================================
// MULTIPLE QUIZZES PATTERN
// ============================================================================

/**
 * If you have multiple difficulty levels or question types,
 * add multiple entries to quizConfig array:
 */

'example-topic': {
  title: 'Example Topic',
  subject: 'Subject',
  curriculum: 'igcse',
  description: '...',
  videos: [],
  resources: [],
  quizConfig: [
    {
      folderPath: '/Questions/igcse/cambridge/subject/beginner',
      title: 'Beginner'
    },
    {
      folderPath: '/Questions/igcse/cambridge/subject/intermediate',
      title: 'Intermediate'
    },
    {
      folderPath: '/Questions/igcse/cambridge/subject/advanced',
      title: 'Advanced'
    }
  ]
}

// ============================================================================
// SINGLE-FILE DOWNLOAD-ONLY QUIZZES
// ============================================================================

/**
 * For cases where you have a single PDF file (and optionally a markscheme)
 * instead of multiple questions in a folder, use questionFile and markSchemeFile:
 */

'single-file-topic': {
  title: 'Topic With Single File Quiz',
  subject: 'Subject',
  curriculum: 'igcse',
  description: '...',
  videos: [],
  resources: [],
  quizConfig: [
    {
      questionFile: '/Questions/igcse/cambridge/subject/exam-paper.pdf',
      markSchemeFile: '/Questions/igcse/cambridge/subject/exam-paper-ms.pdf', // Optional
      title: 'Download Exam Paper'
    }
  ]
}

/**
 * Single-file quizzes show download buttons instead of opening files in the viewer.
 * Users can download the question paper and markscheme directly.
 * 
 * Format:
 * - questionFile: Path to the question PDF file (required)
 * - markSchemeFile: Path to the markscheme PDF file (optional)
 * - title: Display name for the quiz
 */

// ============================================================================
// TOPICS WITHOUT QUIZZES
// ============================================================================

/**
 * These are fine - they just won't show quiz tab:
 */

'no-quiz-topic': {
  title: 'Topic Without Quizzes',
  subject: 'Subject',
  curriculum: 'igcse',
  description: '...',
  videos: [],
  resources: [],
  // Either omit quizConfig entirely, or set it to empty array:
  // quizConfig: []
}

// ============================================================================
// FOLDER STRUCTURE YOUR QUESTIONS SHOULD MATCH
// ============================================================================

/**
 * /public/Questions/
 * ├── igcse/
 * │   ├── cambridge/
 * │   │   ├── biology/
 * │   │   │   ├── Q1.pdf
 * │   │   │   ├── Q2.pdf
 * │   │   │   ├── Q3.png
 * │   │   │   ├── MS1.pdf
 * │   │   │   ├── MS2.pdf
 * │   │   │   └── MS3.jpg
 * │   │   ├── chemistry/
 * │   │   └── physics/
 * │   └── edexcel/
 * └── alevel/
 *     └── cambridge/
 *         ├── chemistry/
 *         ├── physics/
 *         └── ...
 */

// ============================================================================
// FILE NAMING RULES
// ============================================================================

/**
 * QUESTION FILES:
 * Q1.pdf, Q2.pdf, Q3.pdf ...     (PDF format)
 * Q1.png, Q2.png, Q3.png ...     (PNG format)
 * Q1.jpg, Q2.jpg, Q3.jpg ...     (JPEG format)
 * 
 * MARK SCHEME FILES:
 * MS1.pdf, MS2.pdf, MS3.pdf ...  (PDF format)
 * MS1.png, MS2.png, MS3.png ...  (PNG format)
 * MS1.jpg, MS2.jpg, MS3.jpg ...  (JPEG format)
 * 
 * PAIRING:
 * Q1 is automatically paired with MS1
 * Q2 is automatically paired with MS2
 * etc.
 * 
 * FORMATS:
 * Q1.pdf + MS1.pdf ✓ (same format)
 * Q1.pdf + MS1.png ✓ (mixed format)
 * Q1.jpg + MS1.pdf ✓ (any combination)
 * 
 * SEQUENCING:
 * Must be sequential: Q1, Q2, Q3...
 * Cannot skip numbers: Q1, Q3, Q5 ✗
 * No leading zeros: Q01.pdf ✗ (use Q1.pdf instead)
 */
