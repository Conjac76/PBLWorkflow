# 04 Nonfunctional Requirements

## Performance
- Dashboard group list should render quickly for active classes.
- Keep indicator set intentionally small and preranked.

## Reliability
- API input validation on every write endpoint.
- Idempotent reads for student and teacher views.

## Usability
- Student UI minimizes required fields.
- Teacher cards show attention first state in one scan.

## Interpretability
- Every triggered indicator must include plain language rationale and evidence links.

## Deployability
- One backend service + one frontend service.
