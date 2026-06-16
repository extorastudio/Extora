#!/bin/sh
# Extora Core — Docker Entrypoint
# Generates Prisma client if needed, then starts the server
set -e

cd /app/apps/core

# Check if Prisma client is generated
if [ ! -f /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/index.js ] && [ ! -f /app/node_modules/@prisma/client/index.js ]; then
    echo "Generating Prisma client..."
    cd /app/apps/core
    npx prisma generate --schema=prisma/schema.prisma 2>/dev/null || true
fi

echo "Starting Extora Core..."
exec node dist/src/index.js
