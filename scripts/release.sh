#!/bin/bash
set -e

VERSION_FILE="VERSION"
CURRENT_VERSION=$(cat $VERSION_FILE)

echo "============================================"
echo "  Extora Release Pipeline"
echo "  Current Version: $CURRENT_VERSION"
echo "============================================"
echo ""

# Parse version bump type
BUMP_TYPE=${1:-patch}

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
case $BUMP_TYPE in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Usage: $0 [major|minor|patch]"; exit 1 ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "Bumping: $CURRENT_VERSION → $NEW_VERSION"

# Step 1: Update VERSION file
echo "$NEW_VERSION" > $VERSION_FILE
echo "  ✓ VERSION file updated"

# Step 2: Update root package.json
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json
rm -f package.json.bak
echo "  ✓ package.json updated"

# Step 3: Update CLI package.json
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" apps/cli/package.json 2>/dev/null
rm -f apps/cli/package.json.bak 2>/dev/null

# Step 4: Run full build pipeline
echo ""
echo "Running build pipeline..."
bash scripts/build-all.sh
echo ""

# Step 5: Git commit + tag
echo "Creating release commit..."
git add -A
git commit -m "release: v$NEW_VERSION

$(cat VERSION_FILE)
- Version bump: $CURRENT_VERSION → $NEW_VERSION
- Build verified: tests pass, lint pass, typecheck pass" || echo "  No changes to commit"

git tag -a "v$NEW_VERSION" -m "Extora v$NEW_VERSION" 2>/dev/null || echo "  Tag already exists"

echo ""
echo "============================================"
echo "  ✓ Released Extora v$NEW_VERSION"
echo "  Run: git push origin main --tags"
echo "============================================"
