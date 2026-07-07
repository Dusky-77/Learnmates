// Small, dependency-free helpers used by the Topical Pages feature.
// Pulled out of TopicalPages.tsx so that file only has to worry about
// state + composition, not string/number parsing rules.

// Subjects under Cambridge that use a paper-based filter instead of the generic
// MCQ / Theory filter. Cambridge component codes follow the pattern
// <paper><variant>, e.g. 11, 12, 13 => Paper 1; 21, 22, 23 => Paper 2;
// 31, 32, 33 => Paper 3; 41, 42, 43 => Paper 4. For Cambridge A-level science
// subjects we keep the same workflow but limit the available options to papers 1, 2 and 4.
export const PAPER_FILTER_SUBJECTS = ['Biology', 'Physics', 'Chemistry'];

export const isPaperFilterSubject = (level: string, board: string, subject: string) =>
  ['igcse', 'a-level'].includes(level) && board === 'cambridge' && PAPER_FILTER_SUBJECTS.includes(subject);

export const isCambridgeScienceMcqSubject = (level: string, board: string, subject: string) =>
  ['igcse', 'a-level'].includes(level) && board === 'cambridge' && PAPER_FILTER_SUBJECTS.includes(subject);

export const getDefaultPaperOptions = (level: string, board: string, subject: string): number[] => {
  if (level === 'a-level' && board === 'cambridge' && PAPER_FILTER_SUBJECTS.includes(subject)) {
    return [1, 2, 4];
  }
  return [1, 2, 3, 4];
};

// Extracts the paper number (1-4, or whatever the first digit of the
// component code is) from a past-paper file name. Looks for patterns like
// "qp_12", "ms-41", "_p11", or a bare "p13" in the file name and returns the
// first digit of the two-digit component code. Returns null if no such
// pattern can be found.
export const getPaperNumberFromFileName = (fileName: string | undefined | null): number | null => {
  if (!fileName) return null;
  const match = fileName.match(/\b(?:qp|ms|p)(?:[-_ ]?)([1-4])\d\b/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};

export const getPaperKeyFromFileName = (fileName: string | undefined | null): string | null => {
  if (!fileName) return null;
  return fileName.replace(/Q\d+$/i, 'MS');
};

export const getYearFromFileName = (fileName: string | undefined | null): number | null => {
  if (!fileName) return null;
  const match = fileName.match(/\b(?:19|20)\d{2}\b/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return null;
};

export const makeKey = (level: string, board: string, subject: string, unit: string, name: string) =>
  `${level}||${board}||${subject}||${unit}||${name}`;
