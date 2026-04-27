# Student Workflow Driven Management Tool (PBL)

Note: Render's Free tier has cold starts and may take up to 30 seconds to load at first.
- Live frontend: https://pblworkflow-1.onrender.com
- Live backend: https://pblworkflow.onrender.com/health

A two-mode web app for project-based learning orchestration:
- **Student mode:** milestones, artifacts, check-ins, tagged comments
- **Teacher mode:** group dashboard, evidence timeline, ranked/color-coded indicators

## Final Status

### Implemented
- Student workflow UI with collapsible navigation and group context
- Milestone board (title, description, goal date, status, definition of done)
- Artifact workflow (link upload, milestone tagging, optional revision tagging)
- Timeline grouped by date with expandable artifact/check-in details
- Separate check-in and comments panels
- Teacher dashboard home + group evidence view
- Teacher feedback on timeline items, visible on student side
- Indicator engine with ranking + severity coloring
- Event logging model on create/update actions
- Seeded demo groups for indicator coverage

### Indicators
- `progress_trajectory`
- `help_seeking` (over-help / under-help)
- `milestone_drift`
- `revision_frequency`
- `gaming`
- `wheel_spinning`

Trigger reference: `docs/architecture/05-indicator-triggers.md`

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript + Zod
- Runtime data layer: in-memory store (seeded for demo)

## Local Run

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

Build check:

```bash
npm run build
```

## Render Deployment

### Backend (Web Service)
- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### Frontend (Static Site)
- Root Directory: `apps/web`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://pblworkflow.onrender.com`

SPA fallback is configured via `apps/web/public/_redirects`.

## API Endpoints (Core)

### Student mode
- `GET /api/student/navigation`
- `POST /api/student/groups`
- `GET /api/student/groups/:groupId/board`
- `POST /api/student/milestones`
- `PATCH /api/student/milestones/:id`
- `POST /api/student/artifacts`
- `PATCH /api/student/artifacts/:id`
- `POST /api/student/checkins`
- `PATCH /api/student/checkins/:id`
- `POST /api/student/comments`
- `PATCH /api/student/comments/:id`

### Teacher mode
- `GET /api/teacher/groups`
- `GET /api/teacher/groups/:groupId/evidence`
