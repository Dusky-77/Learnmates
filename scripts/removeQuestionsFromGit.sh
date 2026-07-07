#!/bin/bash
# Remove question files from Git tracking (but keep them locally)
# This script removes PDF/image files that are now stored in Blob

echo "🔍 Finding tracked question files..."
FILES=$(git ls-files public/Questions/ | grep -E "\.(pdf|png|jpg|jpeg|gif|webp)$")

if [ -z "$FILES" ]; then
    echo "✅ No question files found in Git tracking"
    exit 0
fi

COUNT=$(echo "$FILES" | wc -l)
echo "📊 Found $COUNT files to remove from Git tracking"
echo ""
echo "Files will be removed from Git but kept locally"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "🗑️  Removing files from Git tracking..."
echo "$FILES" | while read -r file; do
    git rm --cached "$file" 2>/dev/null && echo "  ✅ Removed: $file" || echo "  ⚠️  Failed: $file"
done

echo ""
echo "✅ Done! Files removed from Git tracking (but kept locally)"
echo ""
echo "📝 Next steps:"
echo "   1. Review changes: git status"
echo "   2. Commit: git commit -m 'Remove question files from Git (now in Blob)'"
echo "   3. Push: git push"

