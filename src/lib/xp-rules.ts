export const XP_RULES = {
  active_time: {
    amountPerMinute: 2,
    dailyCap: 40,
    checkInterval: 60000, // 60 seconds
    requireTabVisible: true,
    requireMouseMoving: true
  },
  scrolling: {
    amountPerMinute: 15,
    dailyCap: 150,
    checkInterval: 60000, // 60 seconds
    maxScrollSpeed: 150, // pixels per second (slow/natural reading speed)
    requireReachedBottom: true
  },
  question_view: {
    amountPerView: 5,
    dailyCap: 100,
    minViewDuration: 45, // seconds
    requireSawQuestion: true,
    requireSawMS: true
  },
  download: {
    amount: 25,
    dailyCap: 75
  },
  paper_download: {
    amount: 30,
    dailyCap: 60
  }
};

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateNextLevelXP(xp: number): number {
  const level = Math.floor(xp / 100) + 1;
  return level * 100;
}

export function calculateProgress(xp: number): number {
  const currentLevel = Math.floor(xp / 100);
  const currentLevelXP = currentLevel * 100;
  const nextLevelXP = (currentLevel + 1) * 100;
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}
