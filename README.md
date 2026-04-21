# Student Workflow Driven Management Tool (PBL)

Web app for project based learning managment with:
- Student workflow mode (milestones, artifacts, check ins, comments)
- Teacher dashboard mode (group monitoring, evidence view, ranked indicators)

## Current project status

### Student mode
- Left navigation with unit/group selection and group creation
- Milestone board with fields:
  - title, description, goal date (optional), status, definition of done
- Artifact workflow:
  - link upload, milestone tagging, notes
  - optional explicit revision tagging
- Timeline view:
  - grouped by date
  - clickable artifacts/check ins with item details
- Separate check in and comments panels
- Comments are tagged to specific items (artifact/check in/milestone)

### Teacher mode
- Dashboard home with group cards
- Card fields:
  - current milestone
  - time since last update
  - help requested flag
  - top ranked indicators
- Color coded indicator severity and explicit rank
- Evidence view with same timeline structure as student mode
- Teacher feedback/comments on timeline items, visible in student mode
- Context layer for dashboard state management

### Analytics and eventing
- Indicator computation (ranked top 3 per group):
  - progress_trajectory
  - help_seeking (over-help / under-help)
  - milestone_drift
  - revision_frequency
  - gaming
  - wheel_spinning
- Event log model with write trigger behavior on create/update actions
- Multi group demo data for indicator coverage
- Indicator trigger reference: `docs/architecture/05-indicator-triggers.md`

## Tech stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript + Zod
- Data layer: in-memory store for local demo

## Local run

1) Install dependencies:
```bash
npm install
```

2) Start API + web:
```bash
npm run dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

3) Build check:
```bash
npm run build
```

## Render frontend deployment (Static Site)

- Root Directory: `apps/web`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://pblworkflow.onrender.com`

SPA routing support is included via `apps/web/public/_redirects`.

## API map (core endpoints)

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

## Known gaps / next priorities
- PostgreSQL runtime integration (replace in-memory store)
- Cloud deployment (API + web)
- Auth/roles hardening (student vs teacher permissions)
