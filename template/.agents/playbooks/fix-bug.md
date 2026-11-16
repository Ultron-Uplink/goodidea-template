# Playbook: fix-bug (issue label `type:bug`)
1. Reproduce first. Write a failing test or capture the exact log line that shows the bug. No reproduction, no fix: comment what you tried and label `agent:blocked`.
2. Name the cause in the PR in one sentence. Do not change timeouts, retries or config until the cause is shown.
3. Fix the cause. The failing test now passes. Add no unrelated changes.
4. Run `pnpm verify`. Open one PR with `Closes #<issue>` and the before/after test output from CI.
