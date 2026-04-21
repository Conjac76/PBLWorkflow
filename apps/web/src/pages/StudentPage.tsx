import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Artifact, CheckIn, Comment, Group, Milestone, Project } from "../types/domain";

type NavigationProject = Project & { groups: Group[] };

export const StudentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<NavigationProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [navCollapsed, setNavCollapsed] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneGoalDate, setMilestoneGoalDate] = useState("");
  const [milestoneDefinitionOfDone, setMilestoneDefinitionOfDone] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<Milestone["status"]>("not_started");
  const [artifactTitle, setArtifactTitle] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [artifactNote, setArtifactNote] = useState("");
  const [artifactMilestoneId, setArtifactMilestoneId] = useState("");
  const [artifactIsRevision, setArtifactIsRevision] = useState(false);
  const [artifactParentId, setArtifactParentId] = useState("");
  const [checkInText, setCheckInText] = useState("");
  const [helpRequested, setHelpRequested] = useState(false);
  const [checkInMilestoneId, setCheckInMilestoneId] = useState("");
  const [openTimelineItemId, setOpenTimelineItemId] = useState<string | null>(null);

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

  const loadBoard = async (groupId: string) => {
    if (!groupId) return;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;
    if (!project.groups.find((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(project.groups[0]?.id ?? "");
    }
  }, [selectedProjectId, projects, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) return;
    void loadBoard(selectedGroupId).catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Failed to load group board"),
    );
  }, [selectedGroupId]);

  const timelineGroups = useMemo(() => {
    const items = [
      ...artifacts.map((artifact) => ({
        kind: "artifact" as const,
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
  }, [artifacts, checkIns]);
  const baseArtifacts = useMemo(
    () => artifacts.filter((artifact) => !artifact.isRevision),
    [artifacts],
  );
  const getRevisionsForArtifact = (artifactId: string) =>
    artifacts
      .filter((artifact) => artifact.isRevision && artifact.parentArtifactId === artifactId)
      .sort((a, b) => a.revision - b.revision);
  const commentTargetLabel = (targetType: "artifact" | "checkin" | "milestone", targetId: string): string => {
    if (targetType === "artifact") {
      return artifacts.find((artifact) => artifact.id === targetId)?.title ?? "Artifact";
    }
    if (targetType === "checkin") {
      return "Check-in";
    }
    return milestones.find((milestone) => milestone.id === targetId)?.title ?? "Milestone";
  };

  const onCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newGroupName.trim()) return;
    await api.createGroup({ projectId: selectedProjectId, name: newGroupName.trim() });
    setNewGroupName("");
    await loadNavigation();
  };

  const onCreateMilestone = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !milestoneTitle.trim()) return;
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

  const onUpdateMilestoneStatus = async (id: string, status: Milestone["status"]) => {
    await api.updateMilestone(id, { status });
    if (selectedGroupId) {
      await loadBoard(selectedGroupId);
    }
  };

  const onCreateArtifact = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !artifactTitle.trim() || !artifactUrl.trim()) return;
    if (artifactIsRevision && !artifactParentId) return;
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

  const onCreateCheckIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !checkInText.trim()) return;
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

  if (loading) return <p>Loading student workspace...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className={`layout student-layout ${navCollapsed ? "nav-collapsed" : ""}`}>
      <aside className={`panel nav-menu ${navCollapsed ? "collapsed" : ""}`}>
        <div className="nav-header">
          <h2>{navCollapsed ? "Menu" : "Student Navigation"}</h2>
          <button type="button" className="nav-toggle" onClick={() => setNavCollapsed((v) => !v)}>
            {navCollapsed ? ">>" : "<<"}
          </button>
        </div>

        {!navCollapsed && (
          <>
            <label>
              Unit
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <form onSubmit={onCreateGroup}>
              <label>
                Create group
                <input
                  className="group-create-input"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name"
                />
              </label>
              <button type="submit">Create group</button>
            </form>
          </>
        )}

        <h3>{navCollapsed ? "Groups" : "Visible groups"}</h3>
        <ul>
          {visibleGroups.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                className={group.id === selectedGroupId ? "selected" : ""}
                onClick={() => setSelectedGroupId(group.id)}
                title={group.name}
              >
                {navCollapsed ? group.name.slice(0, 2).toUpperCase() : group.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="panel">
        <h2>Milestone Board</h2>
        <ul>
          {milestones.map((m) => (
            <li key={m.id}>
              <strong>{m.title}</strong>
              <div>{m.description || "No description yet."}</div>
              <div>Goal date: {m.goalDate ? new Date(m.goalDate).toLocaleDateString() : "None"}</div>
              <div>Definition of done: {m.definitionOfDone || "Not set"}</div>
              <label>
                Status
                <select
                  value={m.status}
                  onChange={(e) =>
                    void onUpdateMilestoneStatus(m.id, e.target.value as Milestone["status"])
                  }
                >
                  <option value="not_started">not started</option>
                  <option value="in_progress">in progress</option>
                  <option value="complete">complete</option>
                  <option value="revised">revised</option>
                </select>
              </label>
            </li>
          ))}
        </ul>
        <form onSubmit={onCreateMilestone}>
          <input
            value={milestoneTitle}
            onChange={(e) => setMilestoneTitle(e.target.value)}
            placeholder="New milestone title"
          />
          <textarea
            value={milestoneDescription}
            onChange={(e) => setMilestoneDescription(e.target.value)}
            placeholder="Description"
          />
          <input
            type="date"
            value={milestoneGoalDate}
            onChange={(e) => setMilestoneGoalDate(e.target.value)}
          />
          <textarea
            value={milestoneDefinitionOfDone}
            onChange={(e) => setMilestoneDefinitionOfDone(e.target.value)}
            placeholder="Definition of done"
          />
          <select
            value={milestoneStatus}
            onChange={(e) => setMilestoneStatus(e.target.value as Milestone["status"])}
          >
            <option value="not_started">not started</option>
            <option value="in_progress">in progress</option>
            <option value="complete">complete</option>
            <option value="revised">revised</option>
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="panel">
        <h2>Artifact Timeline</h2>
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
                        <strong>Comments/Feedback:</strong>
                        <ul>
                          {comments
                            .filter((comment) => comment.targetId === event.id)
                            .map((comment) => (
                              <li key={comment.id}>{comment.text}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <h3>Artifacts</h3>
        <ul>
          {baseArtifacts.map((artifact) => (
            <li key={artifact.id}>
              <div>
                <strong>{artifact.title}</strong> ({new Date(artifact.date).toLocaleDateString()})
              </div>
              <div>Note: {artifact.note || "None"}</div>
              <div>Milestone tag: {milestones.find((m) => m.id === artifact.milestoneId)?.title ?? "None"}</div>
              {getRevisionsForArtifact(artifact.id).length > 0 && (
                <div>
                  Revisions:{" "}
                  {getRevisionsForArtifact(artifact.id)
                    .map((entry) => `r${entry.revision} (${new Date(entry.date).toLocaleDateString()})`)
                    .join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={onCreateArtifact}>
          <input
            value={artifactTitle}
            onChange={(e) => setArtifactTitle(e.target.value)}
            placeholder="Artifact title"
          />
          <input
            value={artifactUrl}
            onChange={(e) => setArtifactUrl(e.target.value)}
            placeholder="https://..."
          />
          <textarea
            value={artifactNote}
            onChange={(e) => setArtifactNote(e.target.value)}
            placeholder="Artifact note"
          />
          <select
            value={artifactMilestoneId}
            onChange={(e) => setArtifactMilestoneId(e.target.value)}
          >
            <option value="">Tag milestone (optional)</option>
            {milestones.map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.title}
              </option>
            ))}
          </select>
          <label>
            <input
              type="checkbox"
              checked={artifactIsRevision}
              onChange={(e) => setArtifactIsRevision(e.target.checked)}
            />
            Tag as revision
          </label>
          {artifactIsRevision && (
            <select value={artifactParentId} onChange={(e) => setArtifactParentId(e.target.value)}>
              <option value="">Base artifact (optional)</option>
              {artifacts.map((artifact) => (
                <option key={artifact.id} value={artifact.id}>
                  {artifact.title} {artifact.isRevision ? `(r${artifact.revision})` : ""}
                </option>
              ))}
            </select>
          )}
          <button type="submit">Add artifact</button>
        </form>
      </section>

      <div className="stack-col">
        <section className="panel">
          <h2>Check-In</h2>
          <form onSubmit={onCreateCheckIn}>
            <textarea
              value={checkInText}
              onChange={(e) => setCheckInText(e.target.value)}
              placeholder="What did you complete? What is next?"
            />
            <label>
              <input
                type="checkbox"
                checked={helpRequested}
                onChange={(e) => setHelpRequested(e.target.checked)}
              />
              Request teacher help
            </label>
            <select value={checkInMilestoneId} onChange={(e) => setCheckInMilestoneId(e.target.value)}>
              <option value="">Tag milestone (optional)</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
            <button type="submit">Submit check-in</button>
          </form>
        </section>

        <section className="panel">
          <h2>Comments</h2>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{commentTargetLabel(comment.targetType, comment.targetId)}</strong>: {comment.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
