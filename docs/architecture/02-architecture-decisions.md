# 02 Architecture Decisions

## 1 Monorepo with app separation
Use one repository with `apps/api` and `apps/web` for simpler project milestone delivery.

## 2 REST over GraphQL
REST chosen for straightforward endpoint contracts, easy curl/Postman testing, and predictable role based access.

## 3 Compute indicators on write and on read fallback
- On writes (milestone/artifact/check in), recompute group indicators.
- On read fallback ensures resilience if an event was missed.

## 4: Student ownership by design
- Student generated check ins and reflections remain editable.
- System recommends attention, but never overrides student workflow states.
