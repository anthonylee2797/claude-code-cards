// SessionStart hook: shows a message to the user. Must never break startup.
try {
  console.log(JSON.stringify({ systemMessage: "claude card nba plug in - welcome" }));
} catch {}
process.exit(0);
