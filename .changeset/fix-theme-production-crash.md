---
"@conversokit/themes": patch
---

Fix ThemeProvider crashing in production bundles by removing the circular import between theme definitions and the provider.
