import { db } from "../data/store.js";
import { Artifact, CheckIn, GroupIndicator, Milestone } from "../types/domain.js";
import { hoursSince, makeId, nowIso } from "./utils.js";

interface IndicatorCandidate {
  type: GroupIndicator["type"];
  severity: GroupIndicator["severity"];
  score: number;
  reason: string;
  evidenceRefs: GroupIndicator["evidenceRefs"];
}

const severityForScore = (score: number): GroupIndicator["severity"] => {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

const computeProgressTrajectory = (milestones: Milestone[], artifacts: Artifact[]): IndicatorCandidate | null => {
  const mostRecentMilestone = [...milestones].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];
  const mostRecentArtifact = [...artifacts].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];
  if (!mostRecentMilestone || !mostRecentArtifact) return null;

  const idleMilestoneHours = hoursSince(mostRecentMilestone.updatedAt);
  const idleArtifactHours = hoursSince(mostRecentArtifact.updatedAt);
  if (!(idleMilestoneHours > 48 && idleArtifactHours > 48)) return null;

  const score = Math.min(1, (idleMilestoneHours + idleArtifactHours) / 220);
  return {
    type: "progress_trajectory",
    severity: severityForScore(score),
    score,
    reason: `No milestone or artifact progress for ${Math.min(idleMilestoneHours, idleArtifactHours)}+ hours.`,
    evidenceRefs: [
      { type: "milestone", id: mostRecentMilestone.id },
      { type: "artifact", id: mostRecentArtifact.id },
    ],
  };
};

const computeHelpSeeking = (checkIns: CheckIn[]): IndicatorCandidate[] => {
  const candidates: IndicatorCandidate[] = [];

  const helpRequestedRecent = checkIns.filter((c) => c.helpRequested).slice(-3);
  const lowAttemptRecent = helpRequestedRecent.filter((c) => c.attemptCount <= 1);
  if (helpRequestedRecent.length >= 2 && lowAttemptRecent.length >= 2) {
    const score = 0.75;
    candidates.push({
      type: "help_seeking",
      severity: severityForScore(score),
      score,
      reason: "Multiple recent help requests with limited attempts before asking.",
      evidenceRefs: helpRequestedRecent.map((c) => ({ type: "checkin", id: c.id })),
    });
  }

  const blockedWithoutHelp = checkIns.slice(-4).filter((c) => c.blockers.trim().length > 0 && !c.helpRequested);
  if (blockedWithoutHelp.length >= 2) {
    const score = 0.7;
    candidates.push({
      type: "help_seeking",
      severity: severityForScore(score),
      score,
      reason: "Repeated blockers reported without corresponding help requests.",
      evidenceRefs: blockedWithoutHelp.map((c) => ({ type: "checkin", id: c.id })),
    });
  }

  return candidates;
};

const computeMilestoneDriftAndRevision = (milestones: Milestone[], artifacts: Artifact[]): IndicatorCandidate[] => {
  const candidates: IndicatorCandidate[] = [];

  const overdueInProgress = milestones.filter(
    (m) => m.status !== "complete" && m.goalDate && new Date(m.goalDate).getTime() < Date.now(),
  );
  if (overdueInProgress.length > 0) {
    const score = Math.min(1, 0.55 + overdueInProgress.length * 0.15);
    candidates.push({
      type: "milestone_drift",
      severity: severityForScore(score),
      score,
      reason: `${overdueInProgress.length} milestone(s) are past goal date and still not complete.`,
      evidenceRefs: overdueInProgress.map((m) => ({ type: "milestone", id: m.id })),
    });
  }

  const activeBaseArtifacts = artifacts.filter((a) => !a.isRevision);
  if (activeBaseArtifacts.length > 0) {
    const revisionCounts = activeBaseArtifacts.map((base) =>
      artifacts.filter((a) => a.isRevision && a.parentArtifactId === base.id).length,
    );
    const avgRevisions = revisionCounts.reduce((sum, count) => sum + count, 0) / activeBaseArtifacts.length;
    if (avgRevisions < 0.5) {
      const score = 0.6;
      candidates.push({
        type: "revision_frequency",
        severity: severityForScore(score),
        score,
        reason: "Low artifact revision activity may indicate weak iteration depth.",
        evidenceRefs: activeBaseArtifacts.map((a) => ({ type: "artifact", id: a.id })),
      });
    }
  }

  return candidates;
};

const computeGamingAndWheelSpinning = (
  milestones: Milestone[],
  artifacts: Artifact[],
  checkIns: CheckIn[],
): IndicatorCandidate[] => {
  const candidates: IndicatorCandidate[] = [];

  const completedMilestones = milestones.filter((m) => m.status === "complete");
  const completedWithoutEvidence = completedMilestones.filter((milestone) => {
    const taggedArtifacts = artifacts.filter((artifact) => artifact.milestoneId === milestone.id);
    const taggedCheckIns = checkIns.filter((checkIn) => checkIn.milestoneId === milestone.id);
    return taggedArtifacts.length + taggedCheckIns.length === 0;
  });

  if (completedWithoutEvidence.length > 0) {
    const score = 0.8;
    candidates.push({
      type: "gaming",
      severity: severityForScore(score),
      score,
      reason: "Completed milestones are missing tagged artifacts/check-ins as evidence.",
      evidenceRefs: completedWithoutEvidence.map((m) => ({ type: "milestone", id: m.id })),
    });
  }

  const repetitiveCheckIns = checkIns.slice(-3);
  if (repetitiveCheckIns.length >= 3 && new Set(repetitiveCheckIns.map((c) => c.text.toLowerCase().trim())).size === 1) {
    const score = 0.85;
    candidates.push({
      type: "wheel_spinning",
      severity: severityForScore(score),
      score,
      reason: "Recent check-ins are highly repetitive, signaling little strategy change.",
      evidenceRefs: repetitiveCheckIns.map((c) => ({ type: "checkin", id: c.id })),
    });
  }

  return candidates;
};

export const computeIndicatorsForGroup = (groupId: string): GroupIndicator[] => {
  const groupMilestones = db.milestones.filter((m) => m.groupId === groupId);
  const groupArtifacts = db.artifacts.filter((a) => a.groupId === groupId);
  const groupCheckIns = db.checkIns.filter((c) => c.groupId === groupId);

  const candidates: IndicatorCandidate[] = [];

  const progress = computeProgressTrajectory(groupMilestones, groupArtifacts);
  if (progress) candidates.push(progress);
  candidates.push(...computeHelpSeeking(groupCheckIns));
  candidates.push(...computeMilestoneDriftAndRevision(groupMilestones, groupArtifacts));
  candidates.push(...computeGamingAndWheelSpinning(groupMilestones, groupArtifacts, groupCheckIns));

  const now = nowIso();
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((candidate, index) => ({
      id: makeId("indicator"),
      groupId,
      ...candidate,
      rank: index + 1,
      createdAt: now,
      updatedAt: now,
    }));
};
