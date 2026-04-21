import { Artifact, CheckIn, Comment, Group, GroupSnapshot, Milestone, Project } from "../types/domain";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://pblworkflow.onrender.com"
    : "http://localhost:4000");

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const api = {
  getStudentBoard: (groupId: string) =>
    request<{
      group: { id: string; name: string };
      milestones: Milestone[];
      artifacts: Artifact[];
      checkIns: CheckIn[];
      comments: Comment[];
    }>(`/api/student/groups/${groupId}/board`),

  getStudentNavigation: () =>
    request<{ projects: Array<Project & { groups: Group[] }> }>("/api/student/navigation"),

  createGroup: (payload: { projectId: string; name: string }) =>
    request<Group>("/api/student/groups", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createMilestone: (payload: {
    groupId: string;
    title: string;
    description: string;
    goalDate?: string;
    status: Milestone["status"];
    definitionOfDone: string;
  }) =>
    request<Milestone>("/api/student/milestones", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMilestone: (id: string, payload: Partial<Pick<Milestone, "title" | "description" | "goalDate" | "status" | "definitionOfDone">>) =>
    request<Milestone>(`/api/student/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  createArtifact: (payload: {
    groupId: string;
    title: string;
    url: string;
    date?: string;
    note: string;
    milestoneId?: string;
    parentArtifactId?: string;
    isRevision?: boolean;
  }) =>
    request<Artifact>("/api/student/artifacts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createCheckIn: (payload: {
    groupId: string;
    milestoneId?: string;
    title: string;
    text: string;
    blockers: string;
    helpRequested: boolean;
    attemptCount: number;
  }) =>
    request<CheckIn>("/api/student/checkins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createComment: (payload: {
    groupId: string;
    title: string;
    text: string;
    targetType: "artifact" | "checkin" | "milestone";
    targetId: string;
  }) =>
    request<Comment>("/api/student/comments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTeacherGroups: () => request<{ groups: GroupSnapshot[] }>("/api/teacher/groups"),

  getTeacherEvidence: (groupId: string) =>
    request<{
      snapshot: GroupSnapshot;
      milestones: Milestone[];
      artifacts: Artifact[];
      checkIns: CheckIn[];
      comments: Comment[];
      indicators: GroupSnapshot["topIndicators"];
    }>(`/api/teacher/groups/${groupId}/evidence`),
};
