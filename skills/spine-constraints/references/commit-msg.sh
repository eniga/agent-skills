#!/bin/sh
# Spine commit-message gate.
#
# A commit that changes behavior must cite what it delivers: a slice (SL-<n>),
# a requirement (R-<n>), or a defect (D-<n>).
#
#   feat(payment-retries): retry on provider timeout (SL-2, R-4)
#
# Exempt: merges, reverts, fixup!/squash!/amend! commits, and the
# conventional types docs, chore, ci, build, style, and test.
#
# As a git hook (shared with the team through the repository):
#   mkdir -p .githooks && cp commit-msg.sh .githooks/commit-msg
#   chmod +x .githooks/commit-msg && git config core.hooksPath .githooks
#
# In CI, where a local hook cannot be skipped with --no-verify:
#   sh .githooks/commit-msg --range origin/main..HEAD
set -eu

EXEMPT_TYPES='docs|chore|ci|build|style|test'
ID='(SL|R|D)-[0-9]+'

# Succeeds when the message (stdin) is exempt or cites an ID.
message_ok() {
  body=$(grep -v '^#' || true)
  subject=$(printf '%s\n' "$body" | sed -n '/[^[:space:]]/{p;q;}')
  case "$subject" in
    "Merge "* | "Revert "* | "fixup! "* | "squash! "* | "amend! "*) return 0 ;;
  esac
  if printf '%s\n' "$subject" | grep -Eq "^($EXEMPT_TYPES)(\([^)]*\))?!?: "; then
    return 0
  fi
  printf '%s\n' "$body" | grep -Eq "(^|[^A-Za-z0-9-])$ID([^A-Za-z0-9-]|\$)"
}

explain() {
  cat >&2 <<EOF
  A commit that changes behavior must cite SL-<n>, R-<n>, or D-<n>, for example:
    feat(<slug>): <what now works> (SL-2, R-4)
  Exempt types: docs, chore, ci, build, style, test.
EOF
}

if [ "${1:-}" = "--range" ]; then
  range=${2:?usage: commit-msg --range <base>..<head>}
  failed=0
  for sha in $(git rev-list --no-merges "$range"); do
    if ! git log -1 --format=%B "$sha" | message_ok; then
      echo "✗ $(git log -1 --format='%h %s' "$sha")" >&2
      failed=1
    fi
  done
  [ "$failed" -eq 0 ] || { explain; exit 1; }
  exit 0
fi

file=${1:?usage: commit-msg <message-file> | --range <base>..<head>}
if ! message_ok <"$file"; then
  echo "✗ commit message cites no traceability ID" >&2
  explain
  exit 1
fi
