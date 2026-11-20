# Static-site security review

## Current architecture
- No accounts, user submission forms, server API, database or sensitive health-data collection.
- Static Astro output.
- External source links open in new tabs and should use `noopener noreferrer`.
- Selected videos use privacy-enhanced embeds. Embeds still involve third-party processing when loaded.

## Release checks
- [ ] Keep repository and deployment permissions least-privilege.
- [ ] Keep secrets out of source code, commits, issue text and build output.
- [ ] Review dependency update pull requests.
- [ ] Run dependency vulnerability checks before releases.
- [ ] Review third-party embed privacy implications.
- [ ] Configure security headers at the hosting layer after deployment; test CSP carefully with media and styles.
- [ ] Verify HTTPS and redirect behaviour.
- [ ] Review the generated static output for accidental data, debug content or secrets.

## Reporting
Use the private reporting guidance in SECURITY.md. Do not request or collect medical details when reporting a website issue.
