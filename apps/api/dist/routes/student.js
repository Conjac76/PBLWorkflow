import { Router } from "express";
import { db, insertArtifact, insertCheckIn, insertComment, insertGroup, insertMilestone, updateArtifact, updateCheckIn, updateComment, updateMilestone, } from "../data/store.js";
import { parseBody } from "../middleware/validate.js";
import { createArtifactSchema, createCheckInSchema, createCommentSchema, createGroupSchema, createMilestoneSchema, updateArtifactSchema, updateCheckInSchema, updateCommentSchema, updateMilestoneSchema, } from "../types/schemas.js";
import { getGroupEvidence, recomputeIndicators } from "../services/groups.js";
export const studentRouter = Router();
studentRouter.get("/projects", (_req, res) => {
    res.json({ projects: db.projects });
});
studentRouter.get("/navigation", (_req, res) => {
    res.json({
        projects: db.projects.map((project) => ({
            ...project,
            groups: db.groups.filter((group) => group.projectId === project.id),
        })),
    });
});
studentRouter.post("/groups", (req, res) => {
    const body = parseBody(createGroupSchema, req, res);
    if (!body)
        return;
    const project = db.projects.find((p) => p.id === body.projectId);
    if (!project)
        return res.status(404).json({ error: "Project not found" });
    const group = insertGroup({ projectId: body.projectId, name: body.name });
    res.status(201).json(group);
});
studentRouter.get("/groups/:groupId/board", (req, res) => {
    const { groupId } = req.params;
    const group = db.groups.find((g) => g.id === groupId);
    if (!group)
        return res.status(404).json({ error: "Group not found" });
    const evidence = getGroupEvidence(groupId);
    res.json({
        group,
        milestones: evidence.milestones,
        artifacts: evidence.artifacts,
        checkIns: evidence.checkIns,
        comments: evidence.comments,
    });
});
studentRouter.post("/milestones", (req, res) => {
    const body = parseBody(createMilestoneSchema, req, res);
    if (!body)
        return;
    const milestone = insertMilestone({
        groupId: body.groupId,
        title: body.title,
        description: body.description ?? "",
        goalDate: body.goalDate,
        status: body.status ?? "not_started",
        definitionOfDone: body.definitionOfDone ?? "",
    });
    recomputeIndicators(milestone.groupId);
    res.status(201).json(milestone);
});
studentRouter.patch("/milestones/:id", (req, res) => {
    const body = parseBody(updateMilestoneSchema, req, res);
    if (!body)
        return;
    const updated = updateMilestone(req.params.id, body);
    if (!updated)
        return res.status(404).json({ error: "Milestone not found" });
    recomputeIndicators(updated.groupId);
    res.json(updated);
});
studentRouter.post("/artifacts", (req, res) => {
    const body = parseBody(createArtifactSchema, req, res);
    if (!body)
        return;
    const artifact = insertArtifact({
        groupId: body.groupId,
        title: body.title,
        url: body.url,
        date: body.date,
        note: body.note ?? "",
        milestoneId: body.milestoneId,
        parentArtifactId: body.parentArtifactId,
        isRevision: body.isRevision ?? false,
    });
    recomputeIndicators(artifact.groupId);
    res.status(201).json(artifact);
});
studentRouter.patch("/artifacts/:id", (req, res) => {
    const body = parseBody(updateArtifactSchema, req, res);
    if (!body)
        return;
    const updated = updateArtifact(req.params.id, body);
    if (!updated)
        return res.status(404).json({ error: "Artifact not found" });
    recomputeIndicators(updated.groupId);
    res.json(updated);
});
studentRouter.post("/checkins", (req, res) => {
    const body = parseBody(createCheckInSchema, req, res);
    if (!body)
        return;
    const checkIn = insertCheckIn({
        groupId: body.groupId,
        milestoneId: body.milestoneId,
        title: body.title,
        text: body.text,
        blockers: body.blockers ?? "",
        helpRequested: body.helpRequested ?? false,
        attemptCount: body.attemptCount ?? 0,
    });
    recomputeIndicators(checkIn.groupId);
    res.status(201).json(checkIn);
});
studentRouter.patch("/checkins/:id", (req, res) => {
    const body = parseBody(updateCheckInSchema, req, res);
    if (!body)
        return;
    const updated = updateCheckIn(req.params.id, body);
    if (!updated)
        return res.status(404).json({ error: "Check-in not found" });
    recomputeIndicators(updated.groupId);
    res.json(updated);
});
studentRouter.post("/comments", (req, res) => {
    const body = parseBody(createCommentSchema, req, res);
    if (!body)
        return;
    const comment = insertComment(body);
    recomputeIndicators(comment.groupId);
    res.status(201).json(comment);
});
studentRouter.patch("/comments/:id", (req, res) => {
    const body = parseBody(updateCommentSchema, req, res);
    if (!body)
        return;
    const updated = updateComment(req.params.id, body);
    if (!updated)
        return res.status(404).json({ error: "Comment not found" });
    recomputeIndicators(updated.groupId);
    res.json(updated);
});
