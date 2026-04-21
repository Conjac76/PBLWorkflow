export type MilestoneStatus = "not_started" | "in_progress" | "complete" | "revised";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Group {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  groupId: string;
  title: string;
  description: string;
  goalDate?: string;
  status: MilestoneStatus;
  definitionOfDone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  groupId: string;
  title: string;
  url: string;
  date: string;
  note: string;
  milestoneId?: string;
  parentArtifactId?: string;
  isRevision: boolean;
  revision: number;
  revisionHistory: Array<{ revision: number; updatedAt: string; note: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  groupId: string;
  milestoneId?: string;
  title: string;
  text: string;
  blockers: string;
  helpRequested: boolean;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  groupId: string;
  title: string;
  text: string;
  targetType: "milestone" | "artifact" | "checkin";
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupIndicator {
  id: string;
  groupId: string;
  type: string;
  severity: "low" | "medium" | "high";
  rank: number;
  reason: string;
  score: number;
  evidenceRefs: Array<{ type: string; id: string }>;
}

export interface GroupSnapshot {
  groupId: string;
  groupName: string;
  projectName: string;
  currentMilestone: string | null;
  timeSinceLastUpdateHours: number;
  helpRequested: boolean;
  topIndicators: GroupIndicator[];
}
