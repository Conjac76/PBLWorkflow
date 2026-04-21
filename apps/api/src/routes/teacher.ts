import { Router } from "express";
import { getGroupEvidence, getTeacherDashboard } from "../services/groups.js";

export const teacherRouter = Router();

teacherRouter.get("/groups", (_req, res) => {
  res.json({ groups: getTeacherDashboard() });
});

teacherRouter.get("/groups/:groupId/evidence", (req, res) => {
  const evidence = getGroupEvidence(req.params.groupId);
  if (!evidence.snapshot) {
    return res.status(404).json({ error: "Group not found" });
  }
  res.json(evidence);
});
