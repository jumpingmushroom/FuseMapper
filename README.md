# FuseMapper

A self-hosted web application for visually mapping Norwegian/European fuse/breaker panels with drag-and-drop device assignment.

## Features

- Visual DIN rail panel representation with configurable rows and slots
- Support for different breaker types (MCB, RCBO, RCD, Main, SPD)
- Drag-and-drop device assignment to breakers
- Device presets for common appliances, lighting, outlets, and heating
- Room management with color coding
- Load calculation with visual indicators (green/yellow/red)
- Export/import panel data as JSON
- Print-friendly panel view

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **State:** TanStack Query (server) + Zustand (UI)
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via Prisma ORM
- **Deploy:** Docker Compose

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/fusemapper.git
cd fusemapper

# Start with Docker Compose
docker compose up -d

# Access the app at http://localhost:3000
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example server/.env

# Generate Prisma client and push database schema
npm run db:generate
npm run db:push

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:server       # Start only backend
npm run dev:client       # Start only frontend

# Build
npm run build            # Build all packages
npm run build:shared     # Build shared package
npm run build:server     # Build server
npm run build:client     # Build client

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations (development)
npm run db:studio        # Open Prisma Studio

# Quality
npm run typecheck        # Type check all packages
npm run lint             # Lint client code
```

## Project Structure

```
fusemapper/
├── package.json              # Workspaces root
├── docker-compose.yml
├── Dockerfile
├── packages/
│   └── shared/               # Shared types & constants
│       └── src/
│           ├── types/
│           ├── constants/
│           └── utils/
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── routes/
│       └── middleware/
└── client/
    └── src/
        ├── api/
        ├── components/
        │   ├── ui/
        │   ├── panel/
        │   ├── device/
        │   └── dnd/
        ├── pages/
        └── hooks/
```

## API Endpoints

### Panels
- `GET /api/panels` - List all panels
- `POST /api/panels` - Create a panel
- `GET /api/panels/:id` - Get a panel with fuses and devices
- `PATCH /api/panels/:id` - Update a panel
- `DELETE /api/panels/:id` - Delete a panel

### Fuses
- `POST /api/panels/:panelId/fuses` - Add a fuse to a panel
- `PATCH /api/fuses/:id` - Update a fuse
- `DELETE /api/fuses/:id` - Delete a fuse

### Devices
- `GET /api/devices` - List devices (query: fuseId, unassigned)
- `POST /api/devices` - Create a device
- `PATCH /api/devices/:id` - Update a device
- `PATCH /api/devices/:id/move` - Move device to a different fuse
- `DELETE /api/devices/:id` - Delete a device

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create a room
- `PATCH /api/rooms/:id` - Update a room
- `DELETE /api/rooms/:id` - Delete a room

### Export/Import
- `GET /api/export` - Export all data as JSON
- `POST /api/import` - Import data from JSON

## Notes

- Designed for Norwegian 230V standard, DIN rail horizontal layout
- Supports 1/2/3-pole breakers (visual width proportional to poles)
- No authentication (single-user self-hosted)
- Load calculation is informational, not a safety tool

## License

MIT
