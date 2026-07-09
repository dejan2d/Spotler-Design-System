#!/usr/bin/env bash
#
# Regenerates CHANGELOG.md from git history.
# Run automatically by .github/workflows/changelog.yml on every push to main.
# Safe to run locally too: `bash scripts/generate-changelog.sh`
#
set -euo pipefail

OUT="CHANGELOG.md"

{
  echo "# Changelog"
  echo
  echo "_Auto-generated from git history on every push to \`main\` by [.github/workflows/changelog.yml](.github/workflows/changelog.yml)._"
  echo "_Do not edit by hand — it is overwritten on each run. This table is mirrored into the Figma \"Design System Change Log — GitHub (Developer)\" page._"
  echo
  echo "| Date | Commit | Author | Change | Files |"
  echo "| --- | --- | --- | --- | --- |"

  git log --no-merges --date=short --pretty=format:'%H%x09%ad%x09%an%x09%s' |
  while IFS=$'\t' read -r hash date author subject; do
    short="${hash:0:7}"
    n=$(git diff-tree --no-commit-id --name-only -r "$hash" | wc -l | tr -d ' ')
    if [ "$n" = "1" ]; then files="1 file"; else files="$n files"; fi
    subject="${subject//|/\\|}"   # escape pipes so the markdown table doesn't break
    echo "| $date | \`$short\` | $author | $subject | $files |"
  done
} > "$OUT"

echo "Wrote $OUT"
