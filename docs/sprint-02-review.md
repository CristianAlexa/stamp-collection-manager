# Sprint 02 — Engineering Review

## Sprint Goal

Build a multi-page Next.js application with reusable
components, theme support and an initial HTTP API.

## Completed Features

- App Router navigation
- Route groups and nested layouts
- Active navigation links
- Reusable PageHeader and FeatureCard
- Light, Dark and System theme preferences
- Theme persistence
- GET /api/stamps
- Country filtering
- Catalogue API integration
- Loading, success, empty and error states

## Architecture Decisions

1. Keep page components server-rendered by default.
2. Use Client Components for interactive behaviour.
3. Keep catalogue data separate from owned collection data.
4. Use semantic colour tokens for theme consistency.
5. Keep API response types explicit.

## Quality Checks

- TypeScript:
- ESLint:
- Prettier:
- Production build:
- API tests:
- Light/Dark/System tests:

## Known Limitations

- Stamp data is currently hardcoded.
- API responses are typed but not runtime-validated.
- Catalogue fetching is browser-side for learning purposes.
- Authentication and persistence are not implemented yet.
