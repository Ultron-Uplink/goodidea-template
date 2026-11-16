# Playbook: ui-change (issue label `area:client` or `area:design`)
1. Read `docs/design/DESIGN.md`. Use its tokens; never hard-code colours, sizes or fonts.
2. Use the accessible primitives already in `client/` before writing a new widget.
3. All visible text lives in the strings file, written in plain human language. Show state with the interface; do not describe it in a paragraph.
4. Capture screenshots at 375, 768 and 1440 wide in CI and attach the CI link as evidence.
5. Run the accessibility and copy checks. Do not change the design tokens without the `design-change` approval of the owner.
