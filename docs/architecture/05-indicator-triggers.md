# 05 Indicator Triggers

This document explains what conditions trigger each indicator and which seeded groups demonstrate them.

## Indicator coverage

| Indicator | Trigger condition (current implementation) | Demo groups |
|---|---|---|
| `progress_trajectory` | Most recent milestone update and most recent artifact update are both older than 48 hours | `Team Nova (group_2)`, `Team Orion (group_4)` |
| `help_seeking` (over help) | At least 2 recent help requests with `attemptCount <= 1` | `Team Atlas (group_3)`, `Team Helix (group_5)` |
| `help_seeking` (under help) | At least 2 recent blocked check ins with no help request | `Team Nova (group_2)` |
| `milestone_drift` | Milestone `goalDate` is past and status is not `complete` | `Team Nova (group_2)`, `Team Delta (group_6)` |
| `revision_frequency` | Average revisions per base artifact is below `0.5` | `Team Atlas (group_3)`, `Team Echo (group_7)` |
| `gaming` | Completed milestone lacks tagged artifact/check in evidence | `Team Flux (group_8)` |
| `wheel_spinning` | Last 3 check ins have identical text | `Team Nova (group_2)` |

## Notes on demo behavior

- Dashboard cards show top ranked indicators only (up to 3 per group), so not every triggered indicator appears on every card.
- To show all indicator types in a demo, switch across groups listed above.

## Implementation files

- Indicator logic: `/Users/connorjacobs/CS6460 - Workflow/apps/api/src/services/indicators.ts`
- Seeded data: `/Users/connorjacobs/CS6460 - Workflow/apps/api/src/data/store.ts`
- Teacher evidence response (includes indicators): `/Users/connorjacobs/CS6460 - Workflow/apps/api/src/services/groups.ts`
