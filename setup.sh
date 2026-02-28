#!/bin/bash

# ═══════════════════════════════════════════════════════
# AERO-DIAG Setup Script
# Quick setup and verification script
# ═══════════════════════════════════════════════════════

set -e

echo "✈️  AERO-DIAG — Setup Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
    
    # Check version >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}⚠${NC} Warning: Node.js 18+ recommended (current: $NODE_VERSION)"
    fi
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo "🔍 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm found: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "🎨 Checking code quality..."
npm run lint

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm test         - Run tests"
echo "  npm run lint     - Check code quality"
echo ""
echo "📚 Documentation:"
echo "  README.md        - Full documentation"
echo "  QUICKSTART.md    - Quick start guide"
echo "  RESULTS.md       - Summary of improvements"
echo ""
echo "🚀 Ready to launch!"
echo "Run: npm run dev"
echo ""
