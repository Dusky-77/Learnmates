import { supabase } from '../lib/supabaseClient';

export interface StreakData {
  currentStreak: number;
  lastVisitDate: string;
  longestStreak: number;
  visitedDates: string[];
}

export interface DayData {
  date: string;
  dayOfMonth: number;
  isVisited: boolean;
  month: string;
}

export const getStreakData = async (): Promise<StreakData> => {
  const { data, error } = await supabase.rpc('get_user_streak');
  
  if (error || !data?.[0]) {
    const today = new Date().toISOString().split('T')[0];
    return {
      currentStreak: 1,
      lastVisitDate: today,
      longestStreak: 1,
      visitedDates: [today]
    };
  }
  
  return {
    currentStreak: data[0].current_streak,
    lastVisitDate: data[0].visited_dates[0],
    longestStreak: data[0].longest_streak,
    visitedDates: data[0].visited_dates
  };
};

export const updateStreak = async (): Promise<StreakData> => {
  await supabase.rpc('add_user_visit');
  return getStreakData();
};

export const getLast30Days = async (): Promise<DayData[]> => {
  const streak = await getStreakData();
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