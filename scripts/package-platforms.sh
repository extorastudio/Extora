#!/bin/bash
set -e

VERSION=$(cat VERSION)
PNPM="/opt/homebrew/lib/node_modules/pnpm/bin/pnpm.cjs"
[ -f "$PNPM" ] || PNPM="pnpm"

echo "============================================"
echo "  Extora v$VERSION — Platform Packaging"
echo "============================================"
echo ""

# Step 1: Build Studio
echo "[1/4] Building Studio..."
cd apps/studio
npx vite build --outDir dist
cd ../..
echo "  ✓ Studio built"

# Step 2: Build Core
echo "[2/4] Building Core..."
cd apps/core
$PNPM run build 2>/dev/null || npx tsc
cd ../..
echo "  ✓ Core built"

# Step 3: Create deploy folder
echo "[3/4] Creating deploy package..."
DEPLOY_DIR="dist/extora-v$VERSION"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/studio"
mkdir -p "$DEPLOY_DIR/core"

cp -r apps/studio/dist/* "$DEPLOY_DIR/studio/"
cp -r apps/core/dist "$DEPLOY_DIR/core/"
cp apps/core/package.json "$DEPLOY_DIR/core/"
cp -r apps/core/prisma "$DEPLOY_DIR/core/"
cp docker/docker-compose.prod.yml "$DEPLOY_DIR/"
cp .env.example "$DEPLOY_DIR/.env"
cp VERSION "$DEPLOY_DIR/"
cp INSTALL.md "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/"

# Create start script
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Extora v$(cat VERSION)..."
echo "Studio: http://localhost:3000"
echo "API: http://localhost:3000/api/v1/system/health"
node core/dist/prod-server.js
EOF
chmod +x "$DEPLOY_DIR/start.sh"

# Create Windows start script
cat > "$DEPLOY_DIR/start.bat" << 'EOF'
@echo off
echo Starting Extora...
echo Studio: http://localhost:3000
node core\dist\prod-server.js
pause
EOF

echo "  ✓ Deploy package created at $DEPLOY_DIR"

# Step 4: Create platform archives
echo "[4/4] Creating platform archives..."
mkdir -p dist/releases

# Linux (.tar.gz)
tar -czf "dist/releases/extora-v$VERSION-linux-x64.tar.gz" -C dist "extora-v$VERSION"
echo "  ✓ Linux: dist/releases/extora-v$VERSION-linux-x64.tar.gz"

# macOS (.tar.gz — same format)
cp "dist/releases/extora-v$VERSION-linux-x64.tar.gz" "dist/releases/extora-v$VERSION-darwin-x64.tar.gz"
cp "dist/releases/extora-v$VERSION-linux-x64.tar.gz" "dist/releases/extora-v$VERSION-darwin-arm64.tar.gz"
echo "  ✓ macOS: dist/releases/extora-v$VERSION-darwin-x64.tar.gz"
echo "  ✓ macOS: dist/releases/extora-v$VERSION-darwin-arm64.tar.gz"

# Windows (.zip)
cd "dist/extora-v$VERSION" && zip -r "../../dist/releases/extora-v$VERSION-win-x64.zip" . && cd ../..
echo "  ✓ Windows: dist/releases/extora-v$VERSION-win-x64.zip"

echo ""
echo "============================================"
echo "  ✓ Packaging Complete"
echo "  Releases: dist/releases/"
ls -lh dist/releases/
echo "============================================"
