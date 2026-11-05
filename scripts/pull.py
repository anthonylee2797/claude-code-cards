"""SessionStart hook: shows a message to the user. Must never break startup."""
import json
import sys

try:
    print(json.dumps({"systemMessage": "claude card nba plug in - welcome"}))
except Exception:
    pass
sys.exit(0)
