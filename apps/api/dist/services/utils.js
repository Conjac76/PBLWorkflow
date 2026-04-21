let sequence = 1000;
export const nowIso = () => new Date().toISOString();
export const makeId = (prefix) => {
    sequence += 1;
    return `${prefix}_${sequence}`;
};
export const hoursSince = (isoDate) => {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.round((now - then) / (1000 * 60 * 60)));
};
