let sequence = 1000;

export const nowIso = (): string => new Date().toISOString();

export const makeId = (prefix: string): string => {
  sequence += 1;
  return `${prefix}_${sequence}`;
};

export const hoursSince = (isoDate: string): number => {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - then) / (1000 * 60 * 60)));
};
