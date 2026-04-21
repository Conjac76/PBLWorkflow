import { db, replaceIndicatorsForGroup } from "../data/store.js";
import { GroupIndicator, GroupSnapshot } from "../types/domain.js";
import { computeIndicatorsForGroup } from "./indicators.js";
import { hoursSince } from "./utils.js";

const newestIso = (values: string[]): string | null => {
  if (!values.length) return null;
  return [...values].sort((a, b) => (a < b ? 1 : -1))[0];
};

export const recomputeIndicators = (groupId: string): GroupIndicator[] => {
  const next = computeIndicatorsForGroup(groupId);
  replaceIndicatorsForGroup(groupId, next);
  return next;
};

export const getGroupSnapshot = (groupId: string): GroupSnapshot | null => {
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null;

  const project = db.projects.find((p) => p.id === group.projectId);
  const milestones = db.milestones.filter((m) => m.groupId === groupId);
  const artifacts = db.artifacts.filter((a) => a.groupId === groupId);
  const checkins = db.checkIns.filter((c) => c.groupId === groupId);

  const currentMilestone = [...milestones].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0] ?? null;

  const lastUpdatedAt = newestIso([
    ...milestones.map((m) => m.updatedAt),
    ...artifacts.map((a) => a.updatedAt),
    ...checkins.map((c) => c.updatedAt),
  ]);

  const topIndicators = [...db.indicators]
    .filter((i) => i.groupId === groupId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    groupId: group.id,
    groupName: group.name,
    projectName: project?.name ?? "Unknown project",
    currentMilestone: currentMilestone?.title ?? null,
    timeSinceLastUpdateHours: lastUpdatedAt ? hoursSince(lastUpdatedAt) : 0,
    helpRequested: checkins.some((c) => c.helpRequested),
    topIndicators,
  };
};

export const getTeacherDashboard = (): GroupSnapshot[] => {
  db.groups.forEach((group) => recomputeIndicators(group.id));
  return db.groups
    .map((group) => getGroupSnapshot(group.id))
    .filter((snapshot): snapshot is GroupSnapshot => snapshot !== null)
    .sort((a, b) => {
      const aScore = a.topIndicators[0]?.score ?? 0;
      const bScore = b.topIndicators[0]?.score ?? 0;
      return bScore - aScore;
    });
};

export const getGroupEvidence = (groupId: string) => {
  recomputeIndicators(groupId);

  return {
    snapshot: getGroupSnapshot(groupId),
    milestones: db.milestones.filter((m) => m.groupId === groupId),
    artifacts: db.artifacts.filter((a) => a.groupId === groupId),
    checkIns: db.checkIns.filter((c) => c.groupId === groupId),
    comments: db.comments.filter((c) => c.groupId === groupId),
    events: db.events
      .filter((event) => event.groupId === groupId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    indicators: db.indicators
      .filter((i) => i.groupId === groupId)
      .sort((a, b) => (a.score < b.score ? 1 : -1)),
  };
};
