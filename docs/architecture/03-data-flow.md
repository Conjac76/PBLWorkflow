# 03 Data Flow

## Student workflow flow
1. Student opens group board.
2. Student creates/updates milestone, artifact, or check in.
3. Indicator engine computes group indicators.
4. Updated board and timeline are returned.

## Teacher dashboard flow
1. Teacher opens dashboard list.
2. API returns group cards with snapshot + top indicators.
3. Teacher opens one group card.
4. API returns evidence view (timeline, comments, indicator panel).

## Alert/evidence linkage
- Each indicator stores `evidenceRefs` with IDs and types.
- Teacher UI links indicator details directly to evidence items.
