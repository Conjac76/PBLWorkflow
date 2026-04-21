const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const request = async (path, init) => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
    }
    return response.json();
};
export const api = {
    getStudentBoard: (groupId) => request(`/api/student/groups/${groupId}/board`),
    getStudentNavigation: () => request("/api/student/navigation"),
    createGroup: (payload) => request("/api/student/groups", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    createMilestone: (payload) => request("/api/student/milestones", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    updateMilestone: (id, payload) => request(`/api/student/milestones/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }),
    createArtifact: (payload) => request("/api/student/artifacts", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    createCheckIn: (payload) => request("/api/student/checkins", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    createComment: (payload) => request("/api/student/comments", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    getTeacherGroups: () => request("/api/teacher/groups"),
    getTeacherEvidence: (groupId) => request(`/api/teacher/groups/${groupId}/evidence`),
};
