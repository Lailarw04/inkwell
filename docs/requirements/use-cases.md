# Use Cases
## US-01: Register Account
### Overview
- **Primary Actor:** Visitor
- **Preconditions:** The visitor is not authenticated.
- **Postconditions:** A new account exists for the submitted email addr
  ess and is ready for email verification.
### Main Success Scenario
1. The visitor submits an email address and password.
2. The system validates the email format and password strength.
3. The system confirms that no account already exists for the email add
   ress.
4. The system creates the account with the password stored as a secure
   hash.
5. The system initiates the email-verification process.
6. The system tells the visitor to verify the account before logging i
   n.
### Extensions
- **2a.** The email format is invalid: system rejects the request and a
  sks for a valid email address.
- **2b.** The password does not meet the password-strength requirement
  s: system rejects the request and explains the requirements.
- **3a.** An account already exists for the submitted email: system ret
  urns a generic registration failure message that does not reveal whethe
  r the email is already registered.
- **5a.** Verification-message delivery fails: the account remains unve
  rified and the user can request another verification message later.
---
## US-02: Log In
### Overview
- **Primary Actor:** Registered user
- **Preconditions:** The user has a registered, verified account.
- **Postconditions:** The user holds a valid access token and refresh t
  oken. The subsequent requests are authenticated.
### Main Success Scenario
1. The user submits an email and password.
2. The system verifies the credentials against the stored password has
   h.
3. The system issues a new access token and refresh token pair.
4. The client stores the refresh token securely and attaches the access
   token to subsequent requests.
### Extensions
- **2a.** Credentials do not match: system returns a generic "invalid e
  mail or password" error, not revealing *which* field was wrong, to avoi
  d account enumeration security issue.
- **2b.** Account exists but is not yet verified: system rejects login
  and offers to resend a verification message.
- **3a.** If refresh token issuance fails: system does not issue an acc
  ess token either. This helps to mitigate no partial authentication stat
  e.
---
  ## US-03: Publish Post
### Overview
- **Primary Actor:** Author (an authenticated user)
- **Preconditions:** The user is authenticated.
- **Postconditions:** A `Post` exists in the `Published` state, visible
  on the public feed and the author's profile.
### Main Success Scenario
1. The author creates a new draft post with a title and body.
2. The system autosaves the draft periodically while the author writes
   (negotiated scope, Section 5.4).
3. The author requests to publish the draft.
4. The system validates the post has a non-empty title and body.
5. The system transitions the post to `Published` and records a publish
   timestamp.
6. The post becomes visible in the public feed and on the author's prof
   ile.
### Extensions
- **1a.** Author navigates away mid-draft: the most recent autosave is
  retained (depends on 5.4's negotiated autosave scope).
- **3a.** Author is not the post's owner (e.g., a stale session referen
  cing another user's draft): system rejects with an authorization error.
- **4a.** Title or body is empty: system rejects the publish request an
  d keeps the post in `Draft`.
---
## US-04: Browse Feed
### Overview
- **Primary Actor:** Reader (authenticated or visitor)
- **Preconditions:** None: the public feed is readable without authenti
  cation.
- **Postconditions:** The reader sees a list of published posts, most r
  ecent first.
### Main Success Scenario
1. The reader navigates to the feed.
2. The system retrieves published posts, ordered by publish date descending, in pages of a fixed size.
3. The reader may request the next page.
### Extensions
- **2a.** No posts exist yet: system shows an explicit empty state, not
  a blank screen (a real requirement, not a cosmetic afterthought). An un
  tested empty state is a common source of embarrassing production bugs.
- **2b.** A requested page is beyond the available data: system returns
  an empty page, not an error.