#!/bin/sh
set -e

cd /app/apps/core

echo "Extora Core — Starting..."

# Generate Prisma client (needs schema + node_modules)
echo "Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

# Push schema (creates tables if they don't exist)
echo "Syncing database schema..."
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>/dev/null || true

# Seed admin user if needed
echo "Seeding default data..."
npx tsx prisma/seed.ts 2>/dev/null || echo "  Seed skipped (may already exist)"

echo "Starting Extora Core on port 3000..."
exec "$@"
