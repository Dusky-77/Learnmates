export interface StreakData {
  currentStreak: number;
  lastVisitDate: string; // ISO date string
  longestStreak: number;
  visitedDates: string[]; // Array of ISO date strings
}

const STREAK_STORAGE_KEY = 'userStreak';

// Get today's date in ISO format (YYYY-MM-DD)
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get yesterday's date
const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Initialize or get existing streak data
export const getStreakData = (): StreakData => {
  const stored = localStorage.getItem(STREAK_STORAGE_KEY);
  
  if (!stored) {
    // First visit
    const today = getTodayDate();
    const initial: StreakData = {
      currentStreak: 1,
      lastVisitDate: today,
      longestStreak: 1,
      visitedDates: [today]
    };
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  
  const parsed = JSON.parse(stored);
  
  // Migrate old data that doesn't have visitedDates
  if (!parsed.visitedDates) {
    parsed.visitedDates = [parsed.lastVisitDate];
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(parsed));
  }
  
  return parsed;
};

// Update streak on visit
export const updateStreak = (): StreakData => {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const current = getStreakData();
  
  // If already visited today, no change
  if (current.lastVisitDate === today) {
    return current;
  }
  
  // If visited yesterday, increment streak
  if (current.lastVisitDate === yesterday) {
    current.currentStreak += 1;
  } else {
    // Streak broken, reset to 1
    current.currentStreak = 1;
  }
  
  // Update longest streak if needed
  if (current.currentStreak > current.longestStreak) {
    current.longestStreak = current.currentStreak;
  }
  
  current.lastVisitDate = today;
  
  // Add today to visited dates if not already there
  if (!current.visitedDates.includes(today)) {
    current.visitedDates.push(today);
  }
  
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(current));
  
  return current;
};

// Reset streak (for debugging or user request)
export const resetStreak = (): void => {
  localStorage.removeItem(STREAK_STORAGE_KEY);
};

// Get calendar data for last 30 days
export interface DayData {
  date: string; // ISO date string
  dayOfMonth: number;
  isVisited: boolean;
  month: string; // e.g., "Jun"
}

export const getLast30Days = (): DayData[] => {
  const streak = getStreakData();
  const today = new Date();
  const days: DayData[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date: dateStr,
      dayOfMonth: date.getDate(),
      isVisited: streak.visitedDates.includes(dateStr),
      month: date.toLocaleString('default', { month: 'short' })
    });
  }
  
  return days;
};
