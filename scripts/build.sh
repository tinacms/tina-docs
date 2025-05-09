#!/bin/bash
set -e

pnpm tinacms build
pnpm next build

# Start the app in the background
pnpm next start &

# Wait a moment for the server to start
sleep 5

# Generate static HTML from the live server
node scripts/generate-pagefind.js

# Run Pagefind on the generated HTML
npx pagefind \
  --site temp-out \
  --output-subdir public/pagefind \
  --root-selector "[data-pagefind-body]" \
  --verbose

# Kill the Next.js server
kill $(lsof -t -i:3000)

# Cleanup
rm -rf temp-out

echo "✅ Pagefind index generated at public/pagefind"
