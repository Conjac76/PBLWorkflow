import cors from "cors";
import express from "express";
import { studentRouter } from "./routes/student.js";
import { teacherRouter } from "./routes/teacher.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
