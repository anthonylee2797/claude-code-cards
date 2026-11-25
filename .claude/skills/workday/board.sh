#!/usr/bin/env bash
# The team board: https://github.com/users/anthonylee2797/projects/4
#   board.sh list                  -> one line per issue: <number> <status> <labels> <title>
#   board.sh move <issue> <Status> -> add the issue to the board if needed, then set its column
# Columns: Backlog, Ready, "In progress", "In review", Done
set -euo pipefail
OWNER=anthonylee2797 REPO=anthonylee2797/claude-code-cards NUM=4
PROJECT_ID=PVT_kwHOAo9yVM4BtIyn FIELD_ID=PVTSSF_lAHOAo9yVM4BtIynzhrTqhY

case "${1:-}" in
  list)
    gh project item-list $NUM --owner $OWNER --limit 200 --format json --jq \
      '.items[] | select(.content.type=="Issue") | "#\(.content.number)\t\(.status // "none")\t\((.labels // []) | join(","))\t\(.content.title)"'
    ;;
  move)
    issue=$2 status=$3
    opt=$(gh project field-list $NUM --owner $OWNER --format json --jq \
      ".fields[] | select(.id==\"$FIELD_ID\") | .options[] | select(.name==\"$status\") | .id")
    [ -n "$opt" ] || { echo "no column named '$status'" >&2; exit 1; }
    # item-add returns the existing item when the issue is already on the board.
    item=$(gh project item-add $NUM --owner $OWNER --url "https://github.com/$REPO/issues/$issue" --format json --jq .id)
    gh project item-edit --project-id $PROJECT_ID --id "$item" --field-id $FIELD_ID --single-select-option-id "$opt" >/dev/null
    echo "#$issue -> $status"
    ;;
  *) echo "usage: board.sh list | board.sh move <issue> <Status>" >&2; exit 1 ;;
esac
