# Agent Rules (applies to Claude Code, Cursor, and Codex)

## Git Workflow (IMPORTANT — standing rule)

**Commit and push automatically after every completed task.** Do not wait for Bubs to ask.

- After finishing each discrete task: `git add -A && git commit -m "<clear one-line message>" && git push` (use `-u origin <branch>` if no upstream).
- One commit per task, plain-English message.
- Never leave completed work uncommitted at the end of a response.
- If a task is interrupted midway, commit what is in a working state with a `WIP:` prefix so no work is ever lost.

## Session handoff

- Keep `NOW.md` at the repo root updated at the end of every work block: what just got done, what is in progress, what's next. Commit it with the work.
- At the start of a session, read `NOW.md` first if it exists — Bubs switches between Claude Code, Cursor, and Codex, so the previous session may have been in a different tool.

## Working style

- Bubs is a designer and business owner, not a developer. Explain in plain language, no engineering jargon.
- Keep tasks small and focused: complete one thing, commit it, move on.
