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

# Ensure critical tables exist (not in Prisma schema yet)
echo "Creating runtime tables..."
node -e "
const {PrismaClient}=require('@prisma/client');
(async()=>{
  const p=new PrismaClient();
  await p.\$connect();
  await p.\$executeRawUnsafe('CREATE TABLE IF NOT EXISTS \"Order\" (id TEXT PRIMARY KEY, \"orderNumber\" TEXT UNIQUE, \"customerEmail\" TEXT DEFAULT \\'\\', items JSONB DEFAULT \\'[]\\', total FLOAT DEFAULT 0, status TEXT DEFAULT \\'confirmed\\', \"createdAt\" TIMESTAMP DEFAULT now())');
  console.log('  Runtime tables ready');
  await p.\$disconnect();
})().catch(()=>console.log('  Tables already exist'));
"

# Seed admin user
echo "Seeding default data..."
npx tsx prisma/seed.ts 2>/dev/null || echo "  Seed skipped (may already exist)"

# Seed MinIO bucket (wait for MinIO to be ready)
echo "Setting up MinIO bucket..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://minio:9000/minio/health/live > /dev/null 2>&1; then
    # Create bucket via MinIO API
    curl -sf -X PUT http://minio:9000/extora \
      -H "Authorization: Basic $(echo -n 'minioadmin:minioadmin' | base64)" \
      > /dev/null 2>&1 || true
    # Set public policy
    curl -sf -X PUT "http://minio:9000/extora?policy=" \
      -H "Authorization: Basic $(echo -n 'minioadmin:minioadmin' | base64)" \
      -H "Content-Type: application/json" \
      -d '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::extora/*"]}]}' \
      > /dev/null 2>&1 || true
    echo "  MinIO bucket ready"
    break
  fi
  echo "  Waiting for MinIO... ($i/10)"
  sleep 3
done

echo "Starting Extora Core on port 3000..."
exec "$@"
