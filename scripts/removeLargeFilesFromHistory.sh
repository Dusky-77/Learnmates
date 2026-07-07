#!/bin/bash
# Remove large files from Git history
# WARNING: This rewrites Git history. Only use if you're the only one working on this repo
# or coordinate with your team first.

echo "⚠️  WARNING: This will rewrite Git history!"
echo "⚠️  Make sure you're the only one working on this repo, or coordinate with your team."
echo ""
echo "This will remove all PDF/PNG files from public/Questions/ in Git history"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "🔍 Finding large files in Git history..."

# Remove all question files from entire Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch public/Questions/**/*.pdf public/Questions/**/*.png public/Questions/**/*.jpg public/Questions/**/*.jpeg public/Questions/**/*.gif public/Questions/**/*.webp" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧹 Cleaning up..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Done! Large files removed from Git history"
echo ""
echo "📝 Next steps:"
echo "   1. Force push: git push --force origin main"
echo "   2. ⚠️  WARNING: Force push rewrites history on GitHub too!"
echo "   3. If others are using this repo, they'll need to re-clone"

