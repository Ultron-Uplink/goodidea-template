# Fixtures

Each `*.fixture.mjs` exports `{ id, description, run(ctx) }`. `ctx.render()` renders a fresh sample project and returns its directory; `ctx.exec(cmd, dir)` runs a command there and returns `{ code, out }`. A fixture throws if the template does NOT behave as the ledger requires.
