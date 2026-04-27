# Catalog

Student: Connor Jacobs
Course Project Track: Development  
Date: April 21, 2026

## Testing / Script

### Option A: Test live deployment
**Note**: Render's free tier has cold starts so it may take up to 60 seconds to load at first.
1. Open frontend: https://pblworkflow-1.onrender.com/student
2. Verify student mode:
   - Navigate groups
   - Create milestone
   - Create artifact + tag milestone
   - Submit check in
3. Switch to teacher mode:
   - Open group card
   - View timeline and indicators
   - Add feedback to an artifact/check in
4. Return to student mode and verify comment visibility.

### Option B: Run locally
1. Install deps:
   - `npm install`
2. Start app:
   - `npm run dev`
3. Open:
   - frontend: `http://localhost:5173`
   - backend health: `http://localhost:4000/health`
4. Repeat verification steps above.

## 1) Submission Overview

This archive contains the implementation and documentation for a two mode web application designed for project based learning (PBL):

- **Student mode** for structured project workflow capture
- **Teacher mode** for orchestration support using interpretable indicators

The submission includes:
- Full source code (frontend + backend)
- Architecture and indicator documentation
- Local run instructions
- Deployment details with live Render links

## 2) Live Deployment Links

**Note**: Render's free tier has cold starts so it may take up to 60 seconds to load at first.
- Frontend: https://pblworkflow-1.onrender.com/student
- Backend Health: https://pblworkflow.onrender.com/health
- Backend Base URL: https://pblworkflow.onrender.com

Notes:
- The frontend calls the backend via `VITE_API_URL`.
- The deployed app currently uses seeded/in memory runtime data

## 3) Repository Structure

- `apps/web/` — React + TypeScript frontend (student + teacher experiences)
- `apps/api/` — Node.js + Express + TypeScript API
- `docs/architecture/` — architecture, data flow, nonfunctional requirements, indicator trigger docs
- `README.md` — setup, deployment, endpoint map, project status
- `Catalog.pdf` — this file

Key docs included:
- `docs/architecture/01-architecture-design.md`
- `docs/architecture/02-architecture-decisions.md`
- `docs/architecture/03-data-flow.md`
- `docs/architecture/04-nonfunctional-requirements.md`
- `docs/architecture/05-indicator-triggers.md`

## 4) System Architecture

### Frontend
- Framework: React + TypeScript + Vite
- Single app with two routes/modes:
  - Student mode
  - Teacher mode

### Backend
- Node.js + Express + TypeScript
- Zod validation at API boundaries
- REST endpoints for student and teacher flows

### Data layer
- In memory seeded store for runtime
- Event logging model for create/update actions
- Indicator computation service for teacher alerts

## 5) Student Mode Features

### 5.1 Navigation and group context
- Left navigation menu (collapsible)
- Unit/project selection
- Visible group selection
- Group creation

### 5.2 Milestone workflow
Each milestone supports:
- `title`
- `description`
- `goalDate` (optional)
- `status` (`not_started`, `in_progress`, `complete`, `revised`)
- `definitionOfDone`

Actions:
- Create milestone
- Update milestone status

### 5.3 Artifact workflow
Each artifact supports:
- `title`
- `url`
- `date`
- `note`
- `milestone` tag
- optional revision metadata (`isRevision`, parent artifact)

Actions:
- Create artifact
- Tag artifact to milestone
- Add note
- Explicitly mark as revision

### 5.4 Check in workflow
Each check in supports:
- text response
- optional milestone tag
- help request flag
- attempts count
- blockers field

Actions:
- Submit check in
- Tag to milestone
- Request help

### 5.5 Timeline and comments
- Date grouped timeline with visual line/connector structure
- Click artifact to inspect note/milestone/link
- Click check in to inspect check in text
- Comments displayed in dedicated panel and tagged to specific targets

## 6) Teacher Mode Features

### 6.1 Dashboard home
- Group cards for class roster overview
- Per card fields:
  - current milestone
  - time since last update
  - help requested flag
  - top indicators

### 6.2 Indicator ranking + color coding
- Indicators are ranked (top 3 shown)
- Severity based color coding

### 6.3 Evidence view
- Group level evidence panel
- Same timeline structure as student mode
- Indicator panel with ranked reasons
- Linked comment/feedback thread behavior

### 6.4 Teacher feedback workflow
- Teacher can add comments to timeline items (artifact/check in)
- Item level feedback is visible in student mode

### 6.5 Context layer
- Teacher dashboard state centralized through React context:
  - selected group
  - group list
  - evidence payload
  - loading/error handling

## 7) Indicator Catalog (Full)

The indicator engine computes a small interpretable set of signals from milestone/artifact/check in behavior.

### 7.1 `progress_trajectory`
**Intent:** detect groups that appear stalled despite time passing.  
**Trigger:** most recent milestone update and most recent artifact update are both older than threshold (48h).  
**Evidence examples:** latest milestone timestamp + latest artifact timestamp.

### 7.2 `help_seeking` (over help)
**Intent:** detect repeated help requests with low independent attempts.  
**Trigger:** multiple recent help requests where attempt count stays low.  
**Evidence examples:** recent check ins with `helpRequested=true` and small `attemptCount`.

### 7.3 `help_seeking` (under help)
**Intent:** detect repeated blocked status without requesting help.  
**Trigger:** multiple recent check ins report blockers but `helpRequested=false`.  
**Evidence examples:** blocked check ins with no help flag.

### 7.4 `milestone_drift`
**Intent:** detect schedule slippage.  
**Trigger:** milestone goal date is in the past while status is not complete.  
**Evidence examples:** overdue in progress milestones.

### 7.5 `revision_frequency`
**Intent:** detect weak iteration depth on artifacts.  
**Trigger:** low average revision activity across base artifacts.  
**Evidence examples:** base artifacts with very few/no revisions.

### 7.6 `gaming`
**Intent:** detect completion claims without sufficient process evidence.  
**Trigger:** completed milestones lacking tagged artifact/check in evidence.  
**Evidence examples:** complete milestones with sparse or missing linked artifacts/check ins.

### 7.7 `wheel_spinning`
**Intent:** detect repeated effort with little strategy change.  
**Trigger:** repeated near identical check in text across recent entries.  
**Evidence examples:** last 3 check ins with highly repetitive text.

### 7.8 Ranking strategy
- Indicators are scored and sorted by severity score.
- Top indicators are assigned ranks
- Dashboard cards surface top ranked signals for quick triage.

## 8) Event Logging

An event log model is implemented for create/update flows:
- milestone created/updated
- artifact created/updated
- check in created/updated
- comment created/updated


## 9) API Coverage

### Student endpoints
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

### Teacher endpoints
- `GET /api/teacher/groups`
- `GET /api/teacher/groups/:groupId/evidence`

## 11) Current Constraints / Known Gaps

- Runtime persistence is currently in memory (seeded).
- Full production persistence/auth hardening is not the focus of this submission.

## 12) Summary

This submission is a working end to end prototype
- Student workflow capture
- Teacher orchestration dashboard
- Interpretable, ranked indicator system
- Item level evidence and feedback loop
- Deployable web experience with live demo links

