#!/bin/sh
set -e

cd /app/apps/core

echo "Extora Core — Starting..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

# Push schema
echo "Syncing database schema..."
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>/dev/null || true

# Seed admin user
echo "Seeding default data..."
npx tsx prisma/seed.ts 2>/dev/null || echo "  Seed skipped (may already exist)"

# Seed MinIO bucket (wait for MinIO to be ready)
echo "Setting up MinIO bucket..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://minio:9000/minio/health/live > /dev/null 2>&1; then
    mc alias set local http://minio:9000 minioadmin minioadmin 2>/dev/null || true
    mc mb local/extora 2>/dev/null || true
    mc anonymous set public local/extora 2>/dev/null || true
    echo "  MinIO bucket ready"
    break
  fi
  echo "  Waiting for MinIO... ($i/10)"
  sleep 3
done

echo "Starting Extora Core on port 3000..."
exec "$@"
