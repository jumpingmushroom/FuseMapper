#!/bin/sh
set -e

# Run prisma migrations
npx prisma db push --skip-generate

exec "$@"
