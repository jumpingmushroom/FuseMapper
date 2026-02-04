# FuseMapper - Claude Development Guide

## Development Procedure

When a new feature or fix has been done:

1. **Make changes** - Implement the feature or fix
2. **Rebuild the local Docker container** - `docker compose build`
3. **Start the container** - `docker compose up -d`
4. **Check the logs** - `docker compose logs` - Verify everything works as it should
5. **Push the changes to GitHub** - `git add . && git commit -m "message" && git push`

**IMPORTANT**: Always verify the container is running properly (step 4) before pushing to GitHub.

## Quick Commands

```bash
# Development (local)
npm install
npm run db:generate
npm run db:push
npm run dev

# Docker build and deploy
docker compose build
docker compose up -d
docker compose logs

# Type checking
npm run typecheck

# Full build
npm run build
```

## Project Structure

- `packages/shared/` - Shared types, constants, and utilities
- `server/` - Express API with Prisma ORM (SQLite)
- `client/` - React frontend with Vite and Tailwind

## Ports

- Development: Frontend at `:5173`, API at `:3001`
- Production Docker: App at `:3050` (mapped to internal `:3000`)

## Key Files

- `server/prisma/schema.prisma` - Database schema
- `packages/shared/src/constants/device-presets.ts` - Device presets
- `client/src/components/panel/PanelGrid.tsx` - Main panel visualization
- `client/src/components/dnd/DndProvider.tsx` - Drag-and-drop context
