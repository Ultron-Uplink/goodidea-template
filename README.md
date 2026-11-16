# goodidea-template

The starting point for every GoodIdea project. Public, MIT licensed; the projects it generates are private by default. GoodIdea's "Create repo" button renders `template/` from an idea; this repo also holds the mistake ledger and the fixtures that keep the template honest.

- `template/` — files for a new project, with `{{@placeholder}}` markers.
- `template.manifest.json` — every placeholder, and which files are static, rendered or model-generated.
- `scripts/render.mjs` — renders `template/` into a directory. Fails on any unresolved placeholder.
- `scripts/self-test.mjs` — renders a sample project and runs its `verify`, then runs every fixture.
- `ledger/ledger.yml` — each mistake we have already paid for, and the control that prevents it.
- `docs/GENERATOR.md` — how GoodIdea's Create repo flow uses this template.
- `scripts/validate-generated.mjs`, `scripts/apply-settings.mjs` — the generator contract and the settings applier.
- `fixtures/` — one test per ledger row, replayed on every template change.

```bash
node scripts/self-test.mjs
```

Version: see `.template-version`. Rules for changing the template: `CONTRIBUTING.md`.
