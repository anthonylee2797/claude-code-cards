#!/usr/bin/env bash
# The team board: https://github.com/users/anthonylee2797/projects/4
#   board.sh list                  -> one line per issue: <number> <status> <labels> <title>
#   board.sh move <issue> <Status> -> add the issue to the board if needed, then set its column
# Columns: Backlog, Ready, Working, Review, Done
#   move also sets the Agent field from the issue's `agent: …` label.
set -euo pipefail
OWNER=anthonylee2797 REPO=anthonylee2797/claude-code-cards NUM=4
PROJECT_ID=PVT_kwHOAo9yVM4BtIyn FIELD_ID=PVTSSF_lAHOAo9yVM4BtIynzhrTqhY AGENT_FIELD_ID=PVTSSF_lAHOAo9yVM4BtIynzhrZ1w0

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
    # Agent column: the name for the issue's agent label (options are "Mark (Product)", etc.).
    case "$(gh issue view "$issue" --repo $REPO --json labels --jq '[.labels[].name] | join(",")')" in
      *"agent: product-manager"*) name=Mark ;;
      *"agent: staff-engineer-web"*) name=Fojas ;;
      *"agent: staff-engineer-backend"*) name=Chad ;;
      *"agent: designer-web"*) name=Maddy ;;
      *"agent: designer-claude-code"*) name=Paige ;;
      *) name= ;;
    esac
    if [ -n "$name" ]; then
      aopt=$(gh project field-list $NUM --owner $OWNER --format json --jq         ".fields[] | select(.id==\"$AGENT_FIELD_ID\") | .options[] | select(.name | startswith(\"$name \")) | .id")
      gh project item-edit --project-id $PROJECT_ID --id "$item" --field-id $AGENT_FIELD_ID --single-select-option-id "$aopt" >/dev/null
    fi
    echo "#$issue -> $status${name:+ ($name)}"
    ;;
  *) echo "usage: board.sh list | board.sh move <issue> <Status>" >&2; exit 1 ;;
esac
