#!/bin/sh
set -e

# Run prisma migrations (accept data loss for schema changes)
npx prisma db push --skip-generate --accept-data-loss

exec "$@"
