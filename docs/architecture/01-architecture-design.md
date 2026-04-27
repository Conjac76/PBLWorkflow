# 01 Architecture Design

## System goal
Build a two sided workflow system for project based learning:
- Student workflow workspace for milestones, artifacts, and check ins.
- Teacher dashboard that surfaces interpretable, actionable alerts.

## High level architecture
- **Frontend:** React + TypeScript single page app with `student` and `teacher` modes.
- **Backend:** Node.js + Express + TypeScript REST API.
- **Analytics:** Indicator engine computes group risk/attention signals from workflow events.

## Runtime contexts
- Student mode:
  - Board of milestones
  - Artifact timeline
  - check in/reflection form
- Teacher mode:
  - Group roster cards
  - Evidence panel for selected group
  - Ranked indicator alerts with evidence links

## Core design principles
- Management first (reduce live cognitive load).
- Actionability over metric volume.
- Process evidence over only outcomes.
- Preserve student ownership and agency.
