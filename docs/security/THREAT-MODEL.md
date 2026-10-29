# docs/security/THREAT-MODEL.md
## Attack Surface
- POST /api/auth/register — unauthenticated, accepts email/di
  splayName/password
- POST /api/auth/login — unauthenticated, accepts email/passw
  ord
- POST /api/posts — authenticated, accepts title/body/tags
- GET /api/posts — unauthenticated, returns paginated feed
- GET /api/posts - no limit on page size
- JWT access tokens — bearer, sent in Authorization header
## STRIDE Analysis, with Risk Rating
| Component | Threat | Category | Likelihood | Impact | Risk
Rating | Mitigation |
|---|---|---|---|---|---|---|
| POST /api/posts | A user forges another user's `authorId` to publish as them | Spoofing | High | High | Critical | Derive author from the authenticated token, never trust client-supplied authorId (Section 5.2) |
| GET /api/posts | Response includes fields beyond what the feed needs (e.g., email) | Information Disclosure | High | Medium | High | Explicit response shaping / DTO (Section 5.3) |
| GET /api/posts | A user overwhelms the server by creating multiple very large post| Denial of Service | High | Medium | High | Create a page limit
| POST /api/auth/login | Unlimited login attempts enable brute-force credential guessing | Denial of Service / Broken Auth | Medium | High | High | Rate limiting (Section 5.4) |
| POST /api/posts | Untrusted `body` content rendered unsanitized on the client, enabling stored XSS | Tampering / Info Disclosure | Medium | High | High | Output encoding on render (Section 5.5) |

### Hardening Log
- 2026 — Lecture 15: Fixed authorId spoofing vulnerability (Section 1.2)
- 2026 — Lecture 15: Added allowlist-based user DTO to prevent field leakage (Section 1.3)
- 2026 — Lecture 15: Added rate limiting to auth endpoints (Section 1.4)
- 2026 — Lecture 15: Verified stored-XSS resistance with regression test (Section 1.5)
- 2026 - Lecture 15: Fixed Denial of Service risk on posts
### Security Measurement Baseline
- Vulnerabilities found this pass: 4 (all remediated)
- Security test coverage: 1 of 4 attack-surface endpoints has a dedicated security regression test
- Maturity note: Inkwell's security practice is currently adhoc/reactive
  (a single hardening pass), not yet an ongoing program — the honest, named starting point
  for future improvement, not a finished state.