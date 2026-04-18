# Profile Logic — User Management

## Endpoint: `GET /api/users/me`

**Controller:** `UserController.java`  
**DTO:** `UserProfileResponse.java`

### Flow
1. JWT token is decoded by `JwtAuthenticationFilter` → `ToolslyUserPrincipal` is set.
2. `UserController.getCurrentUser()` extracts `userId` from the principal.
3. Fetches full `User` entity from DB (including lazy-loaded `Branch`).
4. Maps to `UserProfileResponse`: `userId`, `email`, `role`, `verified`, `branchId`, `branchName`.

### Frontend Integration
- `AuthContext.tsx` calls `/api/users/me` immediately after login and on app mount.
- Enriched data (branchName, verified) is stored in localStorage and React state.
- **Header** (`App.tsx`): Shows email, branch name (or "Global"), and verified badge for renters.
- **Sidebar**: Shows email + branch name below navigation.

### Security
- `/api/users/**` requires `.authenticated()` — any logged-in user can access their own profile.
- No cross-user access is possible since the endpoint reads from JWT principal.

### Data Sources (V11)
| Field | Example (Алексей) | Example (Игорь) |
|---|---|---|
| email | alexey.smirnov@toolsly.com | igor.volkov@mail.com |
| role | STAFF | RENTER |
| verified | true | true |
| branchName | Склад Сокольники (Центр) | null |
