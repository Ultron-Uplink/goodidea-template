# Playbook: blocked-handoff (when you cannot finish)
Stop after two failed attempts on the same step.
1. Label the issue `agent:blocked`.
2. Comment: what you tried (commands and results), what you believe the cause is, and the single thing you need (a decision, a credential, a clarified requirement).
3. Leave the branch and PR as they are; do not open a second PR.
4. Update `STATUS.md` with the blocker.
