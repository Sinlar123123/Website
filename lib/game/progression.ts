export type LevelInfo = {
  level: number;
  xpCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
};

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];

function getThreshold(level: number) {
  if (level < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level];
  }

  const lastKnown = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const extraLevels = level - (LEVEL_THRESHOLDS.length - 1);
  return lastKnown + extraLevels * 600;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xp >= getThreshold(level)) {
    level += 1;
  }
  return level;
}

export function getLevelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp);
  const currentLevelStart = getThreshold(level - 1);
  const nextLevelThreshold = getThreshold(level);
  const xpCurrentLevel = xp - currentLevelStart;
  const xpForNextLevel = nextLevelThreshold - currentLevelStart;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((xpCurrentLevel / xpForNextLevel) * 100)),
  );

  return {
    level,
    xpCurrentLevel,
    xpForNextLevel,
    progressPercent,
  };
}
