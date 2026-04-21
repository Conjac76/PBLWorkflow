import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { api } from "../services/api";
import { TeacherDashboardProvider, useTeacherDashboard } from "../context/TeacherDashboardContext";
const severityClass = (severity) => {
    if (severity === "high")
        return "indicator-high";
    if (severity === "medium")
        return "indicator-medium";
    return "indicator-low";
};
const TeacherPageContent = () => {
    const { groups, selectedGroupId, setSelectedGroupId, evidence, loading, error, refreshEvidence, } = useTeacherDashboard();
    const [openTimelineItemId, setOpenTimelineItemId] = useState(null);
    const [feedbackText, setFeedbackText] = useState("");
    const timelineGroups = useMemo(() => {
        if (!evidence)
            return [];
        const items = [
            ...evidence.artifacts.map((artifact) => ({
                kind: "artifact",
                id: artifact.id,
                label: artifact.title,
                at: artifact.date || artifact.updatedAt,
                detail: {
                    note: artifact.note,
                    milestone: evidence.milestones.find((m) => m.id === artifact.milestoneId)?.title ?? "None",
                    url: artifact.url,
                },
            })),
            ...evidence.checkIns.map((checkIn) => ({
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
    }, [evidence]);
    const onSubmitFeedback = async (e, targetType, targetId) => {
        e.preventDefault();
        if (!selectedGroupId || !feedbackText.trim())
            return;
        await api.createComment({
            groupId: selectedGroupId,
            title: "Teacher feedback",
            text: feedbackText.trim(),
            targetType,
            targetId,
        });
        setFeedbackText("");
        await refreshEvidence();
    };
    if (error)
        return _jsx("p", { className: "error", children: error });
    return (_jsxs("div", { className: "layout two-col", children: [_jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Dashboard Home" }), loading && _jsx("p", { children: "Loading..." }), _jsx("ul", { children: groups.map((group) => (_jsx("li", { children: _jsxs("button", { className: "card-btn", onClick: () => setSelectedGroupId(group.groupId), children: [_jsx("strong", { children: group.groupName }), _jsxs("div", { children: ["Milestone: ", group.currentMilestone ?? "None"] }), _jsxs("div", { children: ["Last update: ", group.timeSinceLastUpdateHours, "h ago"] }), _jsxs("div", { children: ["Help flag: ", group.helpRequested ? "Yes" : "No"] }), _jsxs("div", { className: "indicator-pill-row", children: [group.topIndicators.map((indicator) => (_jsxs("span", { className: `indicator-pill ${severityClass(indicator.severity)}`, children: ["#", indicator.rank, " ", indicator.type] }, indicator.id))), group.topIndicators.length === 0 && _jsx("span", { className: "indicator-pill indicator-low", children: "No alerts" })] })] }) }, group.groupId))) })] }), _jsxs("section", { className: "panel", children: [_jsx("h2", { children: "Evidence View" }), !evidence ? (_jsx("p", { children: "Select a group." })) : (_jsxs(_Fragment, { children: [_jsx("h3", { children: evidence.snapshot.groupName }), _jsxs("p", { children: ["Project: ", evidence.snapshot.projectName] }), _jsx("h4", { children: "Timeline" }), _jsxs("div", { className: "timeline", children: [_jsx("div", { className: "timeline-main-line" }), timelineGroups.map((group) => (_jsxs("div", { className: "timeline-date-group", children: [_jsx("div", { className: "timeline-date", children: group.date }), group.events.map((event, idx) => (_jsxs("div", { className: "timeline-event-row", children: [_jsx("div", { className: "timeline-connector" }), _jsx("button", { type: "button", className: `timeline-event ${event.kind}`, onClick: () => setOpenTimelineItemId((current) => (current === event.id ? null : event.id)), children: event.label }), openTimelineItemId === event.id && (_jsxs("div", { className: "timeline-detail", children: [event.kind === "artifact" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("strong", { children: "Note:" }), " ", event.detail.note || "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Milestone:" }), " ", event.detail.milestone] }), _jsxs("div", { children: [_jsx("strong", { children: "Link:" }), " ", _jsx("a", { href: event.detail.url, target: "_blank", rel: "noreferrer", children: event.detail.url })] })] })) : (_jsxs("div", { children: [_jsx("strong", { children: "Text:" }), " ", event.detail.text] })), _jsxs("div", { children: [_jsx("strong", { children: "Feedback" }), _jsx("ul", { children: evidence.comments
                                                                            .filter((comment) => comment.targetId === event.id)
                                                                            .map((comment) => (_jsx("li", { children: comment.text }, comment.id))) }), _jsxs("form", { onSubmit: (e) => void onSubmitFeedback(e, event.kind === "artifact" ? "artifact" : "checkin", event.id), children: [_jsx("input", { value: feedbackText, onChange: (e) => setFeedbackText(e.target.value), placeholder: "Leave teacher feedback" }), _jsx("button", { type: "submit", children: "Add feedback" })] })] })] }))] }, `${group.date}-${event.kind}-${idx}`)))] }, group.date)))] }), _jsx("h4", { children: "Indicator Panel" }), _jsx("ul", { children: evidence.indicators.map((indicator) => (_jsxs("li", { className: `indicator-list-item ${severityClass(indicator.severity)}`, children: [_jsxs("strong", { children: ["#", indicator.rank, " ", indicator.type] }), " - ", indicator.reason] }, indicator.id))) })] }))] })] }));
};
export const TeacherPage = () => (_jsx(TeacherDashboardProvider, { children: _jsx(TeacherPageContent, {}) }));
