import {
  Artifact,
  CheckIn,
  Comment,
  Group,
  GroupIndicator,
  Milestone,
  Project,
  EventLog,
  EventType,
} from "../types/domain.js";
import { makeId, nowIso } from "../services/utils.js";

const created = nowIso();
const daysAgo = (days: number): string => new Date(Date.now() - days * 86400000).toISOString();

const projects: Project[] = [{ id: "project_1", name: "PBL Science Unit", createdAt: created }];

const groups: Group[] = [
  { id: "group_1", projectId: "project_1", name: "Team Redwood", createdAt: created },
  { id: "group_2", projectId: "project_1", name: "Team Nova", createdAt: created },
  { id: "group_3", projectId: "project_1", name: "Team Atlas", createdAt: created },
  { id: "group_4", projectId: "project_1", name: "Team Orion", createdAt: created },
  { id: "group_5", projectId: "project_1", name: "Team Helix", createdAt: created },
  { id: "group_6", projectId: "project_1", name: "Team Delta", createdAt: created },
  { id: "group_7", projectId: "project_1", name: "Team Echo", createdAt: created },
  { id: "group_8", projectId: "project_1", name: "Team Flux", createdAt: created },
];

const milestones: Milestone[] = [
  {
    id: "milestone_1",
    groupId: "group_1",
    title: "Problem Framing",
    description: "Define the core challenge and research question.",
    goalDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: "in_progress",
    definitionOfDone: "Question and approach approved.",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(3),
  },
  {
    id: "milestone_2",
    groupId: "group_1",
    title: "Prototype Draft",
    description: "Build and refine the first working draft.",
    goalDate: daysAgo(-2),
    status: "in_progress",
    definitionOfDone: "Demo-ready prototype with notes.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
  {
    id: "milestone_3",
    groupId: "group_2",
    title: "Research Plan",
    description: "Define methods and evidence plan.",
    goalDate: daysAgo(2),
    status: "in_progress",
    definitionOfDone: "Plan reviewed by teacher.",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
  {
    id: "milestone_4",
    groupId: "group_2",
    title: "Data Collection",
    description: "Collect and annotate initial data.",
    goalDate: daysAgo(1),
    status: "in_progress",
    definitionOfDone: "At least 20 samples logged.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "milestone_5",
    groupId: "group_3",
    title: "Hypothesis Draft",
    description: "Draft hypothesis and test criteria.",
    goalDate: daysAgo(1),
    status: "complete",
    definitionOfDone: "Hypothesis and rubric complete.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
  },
  {
    id: "milestone_6",
    groupId: "group_3",
    title: "Prototype Build",
    description: "Assemble first prototype.",
    goalDate: daysAgo(0),
    status: "complete",
    definitionOfDone: "Prototype demo + notes.",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
  },
  {
    id: "milestone_7",
    groupId: "group_4",
    title: "Initial Direction",
    description: "Establish project direction and constraints.",
    goalDate: daysAgo(1),
    status: "in_progress",
    definitionOfDone: "Direction approved.",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(6),
  },
  {
    id: "milestone_8",
    groupId: "group_5",
    title: "Experiment Setup",
    description: "Prepare setup and identify constraints.",
    goalDate: daysAgo(-1),
    status: "in_progress",
    definitionOfDone: "Setup documented and ready.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    id: "milestone_9",
    groupId: "group_6",
    title: "Data Plan",
    description: "Create data plan and collection strategy.",
    goalDate: daysAgo(3),
    status: "in_progress",
    definitionOfDone: "Data plan approved.",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(4),
  },
  {
    id: "milestone_10",
    groupId: "group_7",
    title: "Draft Artifact",
    description: "Produce first draft artifact.",
    goalDate: daysAgo(-2),
    status: "in_progress",
    definitionOfDone: "Draft posted with revision cycle.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  },
  {
    id: "milestone_11",
    groupId: "group_8",
    title: "Claim Draft",
    description: "Submit initial claims.",
    goalDate: daysAgo(0),
    status: "complete",
    definitionOfDone: "Claims submitted and evidenced.",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
  },
  {
    id: "milestone_12",
    groupId: "group_8",
    title: "Validation Pass",
    description: "Confirm claims with validation.",
    goalDate: daysAgo(0),
    status: "complete",
    definitionOfDone: "Validation evidence attached.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
];

const artifacts: Artifact[] = [
  {
    id: "artifact_1",
    groupId: "group_1",
    title: "Initial Research Notes",
    url: "https://example.com/research-notes",
    date: daysAgo(8),
    note: "Compiled source summaries.",
    milestoneId: "milestone_1",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: "artifact_2",
    groupId: "group_1",
    title: "Question Map",
    url: "https://example.com/question-map",
    date: daysAgo(6),
    note: "Mapped key sub-questions and dependencies.",
    milestoneId: "milestone_1",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: "artifact_3",
    groupId: "group_1",
    title: "Prototype Slides",
    url: "https://example.com/prototype-slides",
    date: daysAgo(3),
    note: "Initial prototype walkthrough.",
    milestoneId: "milestone_2",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "artifact_4",
    groupId: "group_1",
    title: "Prototype Slides v2",
    url: "https://example.com/prototype-slides-v2",
    date: daysAgo(1),
    note: "Improved narrative and evidence quality.",
    milestoneId: "milestone_2",
    parentArtifactId: "artifact_3",
    isRevision: true,
    revision: 1,
    revisionHistory: [{ revision: 1, updatedAt: daysAgo(1), note: "Improved narrative and evidence quality." }],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "artifact_5",
    groupId: "group_3",
    title: "Prototype Photo",
    url: "https://example.com/prototype-photo",
    date: daysAgo(1),
    note: "Single evidence artifact despite multiple completed milestones.",
    milestoneId: "milestone_6",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "artifact_6",
    groupId: "group_4",
    title: "Direction Notes",
    url: "https://example.com/orion-direction",
    date: daysAgo(6),
    note: "No recent updates after this point.",
    milestoneId: "milestone_7",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: "artifact_7",
    groupId: "group_5",
    title: "Setup Doc",
    url: "https://example.com/helix-setup",
    date: daysAgo(2),
    note: "Early setup notes.",
    milestoneId: "milestone_8",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "artifact_8",
    groupId: "group_6",
    title: "Plan Outline",
    url: "https://example.com/delta-plan",
    date: daysAgo(4),
    note: "Outline posted, but milestone is overdue.",
    milestoneId: "milestone_9",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: "artifact_9",
    groupId: "group_7",
    title: "Draft Poster",
    url: "https://example.com/echo-poster",
    date: daysAgo(2),
    note: "Single draft, no revisions yet.",
    milestoneId: "milestone_10",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "artifact_10",
    groupId: "group_8",
    title: "Claim Slide",
    url: "https://example.com/flux-claims",
    date: daysAgo(1),
    note: "Only one artifact attached overall.",
    milestoneId: "milestone_11",
    isRevision: false,
    revision: 0,
    revisionHistory: [],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

const checkIns: CheckIn[] = [
  {
    id: "checkin_1",
    groupId: "group_1",
    milestoneId: "milestone_1",
    title: "Daily Check-In",
    text: "Completed source review and drafted key findings.",
    blockers: "Need feedback on scope.",
    helpRequested: true,
    attemptCount: 2,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: "checkin_2",
    groupId: "group_1",
    milestoneId: "milestone_1",
    title: "Daily Check-In",
    text: "Tightened research question and assigned owner roles.",
    blockers: "",
    helpRequested: false,
    attemptCount: 3,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "checkin_3",
    groupId: "group_1",
    milestoneId: "milestone_2",
    title: "Daily Check-In",
    text: "Drafted prototype and identified missing data visuals.",
    blockers: "Need feedback on layout.",
    helpRequested: true,
    attemptCount: 2,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "checkin_4",
    groupId: "group_2",
    milestoneId: "milestone_3",
    title: "Daily Check-In",
    text: "Still blocked on survey design and waiting.",
    blockers: "No approved question set yet.",
    helpRequested: false,
    attemptCount: 0,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "checkin_5",
    groupId: "group_2",
    milestoneId: "milestone_3",
    title: "Daily Check-In",
    text: "Still blocked on survey design and waiting.",
    blockers: "Still no approved question set.",
    helpRequested: false,
    attemptCount: 0,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: "checkin_6",
    groupId: "group_2",
    milestoneId: "milestone_4",
    title: "Daily Check-In",
    text: "Still blocked on survey design and waiting.",
    blockers: "Cannot proceed without sign-off.",
    helpRequested: false,
    attemptCount: 0,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "checkin_7",
    groupId: "group_3",
    milestoneId: "milestone_5",
    title: "Daily Check-In",
    text: "Need feedback before finalizing.",
    blockers: "",
    helpRequested: true,
    attemptCount: 1,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "checkin_8",
    groupId: "group_3",
    milestoneId: "milestone_6",
    title: "Daily Check-In",
    text: "Need feedback before finalizing.",
    blockers: "",
    helpRequested: true,
    attemptCount: 1,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "checkin_9",
    groupId: "group_5",
    milestoneId: "milestone_8",
    title: "Daily Check-In",
    text: "Need help before trying any more steps.",
    blockers: "",
    helpRequested: true,
    attemptCount: 1,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "checkin_10",
    groupId: "group_5",
    milestoneId: "milestone_8",
    title: "Daily Check-In",
    text: "Need help before trying any more steps.",
    blockers: "",
    helpRequested: true,
    attemptCount: 1,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "checkin_11",
    groupId: "group_8",
    title: "Daily Check-In",
    text: "Marked complete and moved on.",
    blockers: "",
    helpRequested: false,
    attemptCount: 2,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

const comments: Comment[] = [
  {
    id: "comment_1",
    groupId: "group_1",
    title: "Peer note",
    text: "Try tightening the question statement before next iteration.",
    targetType: "milestone",
    targetId: "milestone_1",
    createdAt: created,
    updatedAt: created,
  },
];

const indicators: GroupIndicator[] = [];
const events: EventLog[] = [];

export const db = {
  projects,
  groups,
  milestones,
  artifacts,
  checkIns,
  comments,
  indicators,
  events,
};

const logEvent = (params: {
  groupId: string;
  type: EventType;
  entityId: string;
  entityType: EventLog["entityType"];
  metadata?: EventLog["metadata"];
}): EventLog => {
  const event: EventLog = {
    id: makeId("event"),
    groupId: params.groupId,
    type: params.type,
    entityId: params.entityId,
    entityType: params.entityType,
    metadata: params.metadata ?? {},
    createdAt: nowIso(),
  };
  db.events.push(event);
  return event;
};

export const insertGroup = (data: Omit<Group, "id" | "createdAt">): Group => {
  const item: Group = { id: makeId("group"), createdAt: nowIso(), ...data };
  db.groups.push(item);
  return item;
};

export const insertMilestone = (data: Omit<Milestone, "id" | "createdAt" | "updatedAt">): Milestone => {
  const item: Milestone = { id: makeId("milestone"), createdAt: nowIso(), updatedAt: nowIso(), ...data };
  db.milestones.push(item);
  logEvent({
    groupId: item.groupId,
    type: "milestone_created",
    entityId: item.id,
    entityType: "milestone",
    metadata: { status: item.status, title: item.title },
  });
  return item;
};

export const updateMilestone = (id: string, patch: Partial<Milestone>): Milestone | null => {
  const idx = db.milestones.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  db.milestones[idx] = { ...db.milestones[idx], ...patch, updatedAt: nowIso() };
  logEvent({
    groupId: db.milestones[idx].groupId,
    type: "milestone_updated",
    entityId: db.milestones[idx].id,
    entityType: "milestone",
    metadata: { status: db.milestones[idx].status },
  });
  return db.milestones[idx];
};

export const insertArtifact = (
  data: Omit<Artifact, "id" | "date" | "revision" | "revisionHistory" | "createdAt" | "updatedAt"> & {
    date?: string;
  },
): Artifact => {
  const now = nowIso();
  const { date, ...rest } = data;
  const parentArtifact = rest.parentArtifactId
    ? db.artifacts.find((artifact) => artifact.id === rest.parentArtifactId)
    : undefined;
  const initialRevision = rest.isRevision ? (parentArtifact?.revision ?? 0) + 1 : 0;
  const normalizedParentId = rest.isRevision
    ? parentArtifact?.isRevision
      ? (parentArtifact.parentArtifactId ?? parentArtifact.id)
      : parentArtifact?.id
    : undefined;
  const item: Artifact = {
    id: makeId("artifact"),
    date: date ?? now,
    revision: initialRevision,
    revisionHistory: rest.isRevision ? [{ revision: initialRevision, updatedAt: now, note: rest.note }] : [],
    createdAt: now,
    updatedAt: now,
    ...rest,
    parentArtifactId: normalizedParentId,
  };
  db.artifacts.push(item);
  logEvent({
    groupId: item.groupId,
    type: "artifact_created",
    entityId: item.id,
    entityType: "artifact",
    metadata: { milestoneId: item.milestoneId ?? null, isRevision: item.isRevision, revision: item.revision },
  });
  return item;
};

export const updateArtifact = (id: string, patch: Partial<Artifact>): Artifact | null => {
  const idx = db.artifacts.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const current = db.artifacts[idx];
  const changed =
    patch.title !== undefined ||
    patch.url !== undefined ||
    patch.note !== undefined ||
    patch.milestoneId !== undefined;
  const nextRevision = current.revision + (changed ? 1 : 0);
  const nextHistory = changed
    ? [
        ...current.revisionHistory,
        { revision: nextRevision, updatedAt: nowIso(), note: patch.note ?? current.note },
      ]
    : current.revisionHistory;
  db.artifacts[idx] = {
    ...current,
    ...patch,
    revision: nextRevision,
    revisionHistory: nextHistory,
    updatedAt: nowIso(),
  };
  logEvent({
    groupId: db.artifacts[idx].groupId,
    type: "artifact_updated",
    entityId: db.artifacts[idx].id,
    entityType: "artifact",
    metadata: { revision: db.artifacts[idx].revision, milestoneId: db.artifacts[idx].milestoneId ?? null },
  });
  return db.artifacts[idx];
};

export const insertCheckIn = (data: Omit<CheckIn, "id" | "createdAt" | "updatedAt">): CheckIn => {
  const item: CheckIn = { id: makeId("checkin"), createdAt: nowIso(), updatedAt: nowIso(), ...data };
  db.checkIns.push(item);
  logEvent({
    groupId: item.groupId,
    type: "checkin_created",
    entityId: item.id,
    entityType: "checkin",
    metadata: { helpRequested: item.helpRequested, attemptCount: item.attemptCount },
  });
  return item;
};

export const updateCheckIn = (id: string, patch: Partial<CheckIn>): CheckIn | null => {
  const idx = db.checkIns.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  db.checkIns[idx] = { ...db.checkIns[idx], ...patch, updatedAt: nowIso() };
  logEvent({
    groupId: db.checkIns[idx].groupId,
    type: "checkin_updated",
    entityId: db.checkIns[idx].id,
    entityType: "checkin",
    metadata: { helpRequested: db.checkIns[idx].helpRequested, attemptCount: db.checkIns[idx].attemptCount },
  });
  return db.checkIns[idx];
};

export const insertComment = (data: Omit<Comment, "id" | "createdAt" | "updatedAt">): Comment => {
  const item: Comment = { id: makeId("comment"), createdAt: nowIso(), updatedAt: nowIso(), ...data };
  db.comments.push(item);
  logEvent({
    groupId: item.groupId,
    type: "comment_created",
    entityId: item.id,
    entityType: "comment",
    metadata: { targetType: item.targetType, targetId: item.targetId },
  });
  return item;
};

export const updateComment = (id: string, patch: Partial<Comment>): Comment | null => {
  const idx = db.comments.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  db.comments[idx] = { ...db.comments[idx], ...patch, updatedAt: nowIso() };
  logEvent({
    groupId: db.comments[idx].groupId,
    type: "comment_updated",
    entityId: db.comments[idx].id,
    entityType: "comment",
    metadata: { targetType: db.comments[idx].targetType, targetId: db.comments[idx].targetId },
  });
  return db.comments[idx];
};

export const replaceIndicatorsForGroup = (groupId: string, next: GroupIndicator[]): void => {
  const remaining = db.indicators.filter((i) => i.groupId !== groupId);
  db.indicators.length = 0;
  db.indicators.push(...remaining, ...next);
};
