import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
export const StudentPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [milestones, setMilestones] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [checkIns, setCheckIns] = useState([]);
    const [comments, setComments] = useState([]);
    const [milestoneTitle, setMilestoneTitle] = useState("");
    const [milestoneDescription, setMilestoneDescription] = useState("");
    const [milestoneGoalDate, setMilestoneGoalDate] = useState("");
    const [milestoneDefinitionOfDone, setMilestoneDefinitionOfDone] = useState("");
    const [milestoneStatus, setMilestoneStatus] = useState("not_started");
    const [artifactTitle, setArtifactTitle] = useState("");
    const [artifactUrl, setArtifactUrl] = useState("");
    const [artifactNote, setArtifactNote] = useState("");
    const [artifactMilestoneId, setArtifactMilestoneId] = useState("");
    const [artifactIsRevision, setArtifactIsRevision] = useState(false);
    const [artifactParentId, setArtifactParentId] = useState("");
    const [checkInText, setCheckInText] = useState("");
    const [helpRequested, setHelpRequested] = useState(false);
    const [checkInMilestoneId, setCheckInMilestoneId] = useState("");
    const [openTimelineItemId, setOpenTimelineItemId] = useState(null);
    const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
    const visibleGroups = selectedProject?.groups ?? [];
    const loadNavigation = async () => {
        const nav = await api.getStudentNavigation();
        setProjects(nav.projects);
        if (!selectedProjectId && nav.projects.length > 0) {
            const firstProject = nav.projects[0];
            setSelectedProjectId(firstProject.id);
            if (firstProject.groups.length > 0) {
                setSelectedGroupId(firstProject.groups[0].id);
            }
        }
    };
    const loadBoard = async (groupId) => {
        if (!groupId)
            return;
        const data = await api.getStudentBoard(groupId);
        setMilestones(data.milestones);
        setArtifacts(data.artifacts);
        setCheckIns(data.checkIns);
        setComments(data.comments);
    };
    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            await loadNavigation();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load student workspace");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void load();
    }, []);
    useEffect(() => {
        if (!selectedProjectId)
            return;
        const project = projects.find((p) => p.id === selectedProjectId);
        if (!project)
            return;
        if (!project.groups.find((g) => g.id === selectedGroupId)) {
            setSelectedGroupId(project.groups[0]?.id ?? "");
        }
    }, [selectedProjectId, projects, selectedGroupId]);
    useEffect(() => {
        if (!selectedGroupId)
            return;
        void loadBoard(selectedGroupId).catch((err) => setError(err instanceof Error ? err.message : "Failed to load group board"));
    }, [selectedGroupId]);
    const timelineGroups = useMemo(() => {
        const items = [
            ...artifacts.map((artifact) => ({
                kind: "artifact",
                id: artifact.id,
                label: artifact.title,
                at: artifact.date || artifact.updatedAt,
                detail: {
                    note: artifact.note,
                    milestone: milestones.find((m) => m.id === artifact.milestoneId)?.title ?? "None",
                    url: artifact.url,
                },
            })),
            ...checkIns.map((checkIn) => ({
                kind: "checkin",
                id: checkIn.id,
                label: "Check-in",
                at: checkIn.updatedAt,
                detail: {
                    text: checkIn.text,
                },
            })),
        ].sort((a, b) => (a.at < b.at ? 1 : -1));
        const grouped = new Map();
        items.forEach((item) => {
            const key = new Date(item.at).toLocaleDateString();
            grouped.set(key, [...(grouped.get(key) ?? []), item]);
        });
        return [...grouped.entries()].map(([date, events]) => ({ date, events }));
    }, [artifacts, checkIns]);
    const baseArtifacts = useMemo(() => artifacts.filter((artifact) => !artifact.isRevision), [artifacts]);
    const getRevisionsForArtifact = (artifactId) => artifacts
        .filter((artifact) => artifact.isRevision && artifact.parentArtifactId === artifactId)
        .sort((a, b) => a.revision - b.revision);
    const commentTargetLabel = (targetType, targetId) => {
        if (targetType === "artifact") {
            return artifacts.find((artifact) => artifact.id === targetId)?.title ?? "Artifact";
        }
        if (targetType === "checkin") {
            return "Check-in";
        }
        return milestones.find((milestone) => milestone.id === targetId)?.title ?? "Milestone";
    };
    const onCreateGroup = async (e) => {
        e.preventDefault();
        if (!selectedProjectId || !newGroupName.trim())
            return;
        await api.createGroup({ projectId: selectedProjectId, name: newGroupName.trim() });
        setNewGroupName("");
        await loadNavigation();
    };
    const onCreateMilestone = async (e) => {
        e.preventDefault();
        if (!selectedGroupId || !milestoneTitle.trim())
            return;
        await api.createMilestone({
            groupId: selectedGroupId,
            title: milestoneTitle,
            description: milestoneDescription,
            goalDate: milestoneGoalDate ? new Date(milestoneGoalDate).toISOString() : undefined,
            status: milestoneStatus,
            definitionOfDone: milestoneDefinitionOfDone,
        });
        setMilestoneTitle("");
        setMilestoneDescription("");
        setMilestoneGoalDate("");
        setMilestoneDefinitionOfDone("");
        setMilestoneStatus("not_started");
        await loadBoard(selectedGroupId);
    };
    const onUpdateMilestoneStatus = async (id, status) => {
        await api.updateMilestone(id, { status });
        if (selectedGroupId) {
            await loadBoard(selectedGroupId);
        }
    };
    const onCreateArtifact = async (e) => {
        e.preventDefault();
        if (!selectedGroupId || !artifactTitle.trim() || !artifactUrl.trim())
            return;
        if (artifactIsRevision && !artifactParentId)
            return;
        await api.createArtifact({
            groupId: selectedGroupId,
            title: artifactTitle,
            url: artifactUrl,
            note: artifactNote,
            milestoneId: artifactMilestoneId || undefined,
            isRevision: artifactIsRevision,
            parentArtifactId: artifactIsRevision ? artifactParentId || undefined : undefined,
        });
        setArtifactTitle("");
        setArtifactUrl("");
        setArtifactNote("");
        setArtifactMilestoneId("");
        setArtifactIsRevision(false);
        setArtifactParentId("");
        await loadBoard(selectedGroupId);
    };
    const onCreateCheckIn = async (e) => {
        e.preventDefault();
        if (!selectedGroupId || !checkInText.trim())
            return;
        await api.createCheckIn({
            groupId: selectedGroupId,
            milestoneId: checkInMilestoneId || undefined,
            title: "Check-in",
            text: checkInText,
            blockers: "",
            helpRequested,
            attemptCount: 1,
        });
        setCheckInText("");
        setHelpRequested(false);
        setCheckInMilestoneId("");
        await loadBoard(selectedGroupId);
    };
    if (loading)
        return _jsx("p", { children: "Loading student workspace..." });
    if (error)
        return _jsx("p", { className: "error", children: error });
    return (_jsxs("div", { className: `layout student-layout ${navCollapsed ? "nav-collapsed" : ""}`, children: [_jsxs("aside", { className: `panel nav-menu ${navCollapsed ? "collapsed" : ""}`, children: [_jsxs("div", { className: "nav-header", children: [_jsx("h2", { children: navCollapsed ? "Menu" : "Student Navigation" }), _jsx("button", { type: "button", className: "nav-toggle", onClick: () => setNavCollapsed((v) => !v), children: navCollapsed ? ">>" : "<<" })] }), !navCollapsed && (_jsxs(_Fragment, { children: [_jsxs("label", { children: ["Unit", _jsx("select", { value: selectedProjectId, onChange: (e) => setSelectedProjectId(e.target.value), children: projects.map((project) => (_jsx("option", { value: project.id, children: project.name }, project.id))) })] }), _jsxs("form", { onSubmit: onCreateGroup, children: [_jsxs("label", { children: ["Create group", _jsx("input", { className: "group-create-input", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), placeholder: "New group name" })] }), _jsx("button", { type: "submit", children: "Create group" })] })] })), _jsx("h3", { children: navCollapsed ? "Groups" : "Visible groups" }), _jsx("ul", { children: visibleGroups.map((group) => (_jsx("li", { children: _jsx("button", { type: "button", className: group.id === selectedGroupId ? "selected" : "", onClick: () => setSelectedGroupId(group.id), title: group.name, children: navCollapsed ? group.name.slice(0, 2).toUpperCase() : group.name }) }, group.id))) })] }), _jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Milestone Board" }), _jsx("ul", { children: milestones.map((m) => (_jsxs("li", { children: [_jsx("strong", { children: m.title }), _jsx("div", { children: m.description || "No description yet." }), _jsxs("div", { children: ["Goal date: ", m.goalDate ? new Date(m.goalDate).toLocaleDateString() : "None"] }), _jsxs("div", { children: ["Definition of done: ", m.definitionOfDone || "Not set"] }), _jsxs("label", { children: ["Status", _jsxs("select", { value: m.status, onChange: (e) => void onUpdateMilestoneStatus(m.id, e.target.value), children: [_jsx("option", { value: "not_started", children: "not started" }), _jsx("option", { value: "in_progress", children: "in progress" }), _jsx("option", { value: "complete", children: "complete" }), _jsx("option", { value: "revised", children: "revised" })] })] })] }, m.id))) }), _jsxs("form", { onSubmit: onCreateMilestone, children: [_jsx("input", { value: milestoneTitle, onChange: (e) => setMilestoneTitle(e.target.value), placeholder: "New milestone title" }), _jsx("textarea", { value: milestoneDescription, onChange: (e) => setMilestoneDescription(e.target.value), placeholder: "Description" }), _jsx("input", { type: "date", value: milestoneGoalDate, onChange: (e) => setMilestoneGoalDate(e.target.value) }), _jsx("textarea", { value: milestoneDefinitionOfDone, onChange: (e) => setMilestoneDefinitionOfDone(e.target.value), placeholder: "Definition of done" }), _jsxs("select", { value: milestoneStatus, onChange: (e) => setMilestoneStatus(e.target.value), children: [_jsx("option", { value: "not_started", children: "not started" }), _jsx("option", { value: "in_progress", children: "in progress" }), _jsx("option", { value: "complete", children: "complete" }), _jsx("option", { value: "revised", children: "revised" })] }), _jsx("button", { type: "submit", children: "Add" })] })] }), _jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Artifact Timeline" }), _jsxs("div", { className: "timeline", children: [_jsx("div", { className: "timeline-main-line" }), timelineGroups.map((group) => (_jsxs("div", { className: "timeline-date-group", children: [_jsx("div", { className: "timeline-date", children: group.date }), group.events.map((event, idx) => (_jsxs("div", { className: "timeline-event-row", children: [_jsx("div", { className: "timeline-connector" }), _jsx("button", { type: "button", className: `timeline-event ${event.kind}`, onClick: () => setOpenTimelineItemId((current) => (current === event.id ? null : event.id)), children: event.label }), openTimelineItemId === event.id && (_jsxs("div", { className: "timeline-detail", children: [event.kind === "artifact" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("strong", { children: "Note:" }), " ", event.detail.note || "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Milestone:" }), " ", event.detail.milestone] }), _jsxs("div", { children: [_jsx("strong", { children: "Link:" }), " ", _jsx("a", { href: event.detail.url, target: "_blank", rel: "noreferrer", children: event.detail.url })] })] })) : (_jsxs("div", { children: [_jsx("strong", { children: "Text:" }), " ", event.detail.text] })), _jsxs("div", { children: [_jsx("strong", { children: "Comments/Feedback:" }), _jsx("ul", { children: comments
                                                                    .filter((comment) => comment.targetId === event.id)
                                                                    .map((comment) => (_jsx("li", { children: comment.text }, comment.id))) })] })] }))] }, `${group.date}-${event.kind}-${idx}`)))] }, group.date)))] }), _jsx("h3", { children: "Artifacts" }), _jsx("ul", { children: baseArtifacts.map((artifact) => (_jsxs("li", { children: [_jsxs("div", { children: [_jsx("strong", { children: artifact.title }), " (", new Date(artifact.date).toLocaleDateString(), ")"] }), _jsxs("div", { children: ["Note: ", artifact.note || "None"] }), _jsxs("div", { children: ["Milestone tag: ", milestones.find((m) => m.id === artifact.milestoneId)?.title ?? "None"] }), getRevisionsForArtifact(artifact.id).length > 0 && (_jsxs("div", { children: ["Revisions:", " ", getRevisionsForArtifact(artifact.id)
                                            .map((entry) => `r${entry.revision} (${new Date(entry.date).toLocaleDateString()})`)
                                            .join(", ")] }))] }, artifact.id))) }), _jsxs("form", { onSubmit: onCreateArtifact, children: [_jsx("input", { value: artifactTitle, onChange: (e) => setArtifactTitle(e.target.value), placeholder: "Artifact title" }), _jsx("input", { value: artifactUrl, onChange: (e) => setArtifactUrl(e.target.value), placeholder: "https://..." }), _jsx("textarea", { value: artifactNote, onChange: (e) => setArtifactNote(e.target.value), placeholder: "Artifact note" }), _jsxs("select", { value: artifactMilestoneId, onChange: (e) => setArtifactMilestoneId(e.target.value), children: [_jsx("option", { value: "", children: "Tag milestone (optional)" }), milestones.map((milestone) => (_jsx("option", { value: milestone.id, children: milestone.title }, milestone.id)))] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: artifactIsRevision, onChange: (e) => setArtifactIsRevision(e.target.checked) }), "Tag as revision"] }), artifactIsRevision && (_jsxs("select", { value: artifactParentId, onChange: (e) => setArtifactParentId(e.target.value), children: [_jsx("option", { value: "", children: "Base artifact (optional)" }), artifacts.map((artifact) => (_jsxs("option", { value: artifact.id, children: [artifact.title, " ", artifact.isRevision ? `(r${artifact.revision})` : ""] }, artifact.id)))] })), _jsx("button", { type: "submit", children: "Add artifact" })] })] }), _jsxs("div", { className: "stack-col", children: [_jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Check-In" }), _jsxs("form", { onSubmit: onCreateCheckIn, children: [_jsx("textarea", { value: checkInText, onChange: (e) => setCheckInText(e.target.value), placeholder: "What did you complete? What is next?" }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: helpRequested, onChange: (e) => setHelpRequested(e.target.checked) }), "Request teacher help"] }), _jsxs("select", { value: checkInMilestoneId, onChange: (e) => setCheckInMilestoneId(e.target.value), children: [_jsx("option", { value: "", children: "Tag milestone (optional)" }), milestones.map((milestone) => (_jsx("option", { value: milestone.id, children: milestone.title }, milestone.id)))] }), _jsx("button", { type: "submit", children: "Submit check-in" })] })] }), _jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Comments" }), _jsx("ul", { children: comments.map((comment) => (_jsxs("li", { children: [_jsx("strong", { children: commentTargetLabel(comment.targetType, comment.targetId) }), ": ", comment.text] }, comment.id))) })] })] })] }));
};
