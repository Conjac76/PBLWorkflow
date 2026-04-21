import { FormEvent, useMemo, useState } from "react";
import { api } from "../services/api";
import { TeacherDashboardProvider, useTeacherDashboard } from "../context/TeacherDashboardContext";

const severityClass = (severity: "low" | "medium" | "high"): string => {
  if (severity === "high") return "indicator-high";
  if (severity === "medium") return "indicator-medium";
  return "indicator-low";
};

const TeacherPageContent = () => {
  const {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    evidence,
    loading,
    error,
    refreshEvidence,
  } = useTeacherDashboard();
  const [openTimelineItemId, setOpenTimelineItemId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const timelineGroups = useMemo(() => {
    if (!evidence) return [];
    const items = [
      ...evidence.artifacts.map((artifact) => ({
        kind: "artifact" as const,
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
        kind: "checkin" as const,
        id: checkIn.id,
        label: "Check-in",
        at: checkIn.updatedAt,
        detail: {
          text: checkIn.text,
        },
      })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1));

    const grouped = new Map<string, Array<(typeof items)[number]>>();
    items.forEach((item) => {
      const key = new Date(item.at).toLocaleDateString();
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    });

    return [...grouped.entries()].map(([date, events]) => ({ date, events }));
  }, [evidence]);

  const onSubmitFeedback = async (
    e: FormEvent,
    targetType: "artifact" | "checkin",
    targetId: string,
  ) => {
    e.preventDefault();
    if (!selectedGroupId || !feedbackText.trim()) return;

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

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="layout two-col">
      <section className="panel">
        <h2>Dashboard Home</h2>
        {loading && <p>Loading...</p>}
        <ul>
          {groups.map((group) => (
            <li key={group.groupId}>
              <button className="card-btn" onClick={() => setSelectedGroupId(group.groupId)}>
                <strong>{group.groupName}</strong>
                <div>Milestone: {group.currentMilestone ?? "None"}</div>
                <div>Last update: {group.timeSinceLastUpdateHours}h ago</div>
                <div>Help flag: {group.helpRequested ? "Yes" : "No"}</div>
                <div className="indicator-pill-row">
                  {group.topIndicators.map((indicator) => (
                    <span key={indicator.id} className={`indicator-pill ${severityClass(indicator.severity)}`}>
                      #{indicator.rank} {indicator.type}
                    </span>
                  ))}
                  {group.topIndicators.length === 0 && <span className="indicator-pill indicator-low">No alerts</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Evidence View</h2>
        {!evidence ? (
          <p>Select a group.</p>
        ) : (
          <>
            <h3>{evidence.snapshot.groupName}</h3>
            <p>Project: {evidence.snapshot.projectName}</p>

            <h4>Timeline</h4>
            <div className="timeline">
              <div className="timeline-main-line" />
              {timelineGroups.map((group) => (
                <div key={group.date} className="timeline-date-group">
                  <div className="timeline-date">{group.date}</div>
                  {group.events.map((event, idx) => (
                    <div key={`${group.date}-${event.kind}-${idx}`} className="timeline-event-row">
                      <div className="timeline-connector" />
                      <button
                        type="button"
                        className={`timeline-event ${event.kind}`}
                        onClick={() =>
                          setOpenTimelineItemId((current) => (current === event.id ? null : event.id))
                        }
                      >
                        {event.label}
                      </button>
                      {openTimelineItemId === event.id && (
                        <div className="timeline-detail">
                          {event.kind === "artifact" ? (
                            <>
                              <div>
                                <strong>Note:</strong> {event.detail.note || "None"}
                              </div>
                              <div>
                                <strong>Milestone:</strong> {event.detail.milestone}
                              </div>
                              <div>
                                <strong>Link:</strong>{" "}
                                <a href={event.detail.url} target="_blank" rel="noreferrer">
                                  {event.detail.url}
                                </a>
                              </div>
                            </>
                          ) : (
                            <div>
                              <strong>Text:</strong> {event.detail.text}
                            </div>
                          )}

                          <div>
                            <strong>Feedback</strong>
                            <ul>
                              {evidence.comments
                                .filter((comment) => comment.targetId === event.id)
                                .map((comment) => (
                                  <li key={comment.id}>{comment.text}</li>
                                ))}
                            </ul>
                            <form
                              onSubmit={(e) =>
                                void onSubmitFeedback(e, event.kind === "artifact" ? "artifact" : "checkin", event.id)
                              }
                            >
                              <input
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Leave teacher feedback"
                              />
                              <button type="submit">Add feedback</button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <h4>Indicator Panel</h4>
            <ul>
              {evidence.indicators.map((indicator) => (
                <li key={indicator.id} className={`indicator-list-item ${severityClass(indicator.severity)}`}>
                  <strong>#{indicator.rank} {indicator.type}</strong> - {indicator.reason}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export const TeacherPage = () => (
  <TeacherDashboardProvider>
    <TeacherPageContent />
  </TeacherDashboardProvider>
);
