# Session Snapshot: Infinite JWT Token Expiration [2026-06-09]

## 1. Architectural Decisions & Changes

### Infinite JWT Token Expiration
- **Problem**: User sessions were timing out after 24 hours due to the JWT token expiration limit, forcing active players to re-authenticate unnecessarily.
- **Solution**: Removed the expiration mechanism entirely from JWT generation so that tokens remain valid indefinitely.
- **Implementation**:
  - **Configuration**: Removed the `jwt.expiration-ms` binding from `application.properties`.
  - **Backend Layer**: Removed the `Date expiryDate` calculation and the `.expiration(expiryDate)` builder call from both `generateToken()` and `generateTokenFromUsername()` methods inside `JwtTokenProvider.java`.

## 2. Established Constraints
- **Session Lifespan**: JWT tokens are now permanent until explicitly revoked or if the server's signing secret changes. Users will only need to authenticate once.
- **Token Generation Constraints**: No expiration claims should be attached when building JWTs using the `io.jsonwebtoken.Jwts` builder.

## 3. Files Modified This Session

### Backend
| File | Change |
|:---|:---|
| `application.properties` | Removed `jwt.expiration-ms` property |
| `JwtTokenProvider.java` | Removed `jwtExpirationInMs` field, removed expiration logic from `generateToken` and `generateTokenFromUsername` |

## 4. Current System State
- **Docker Compose**: Needs backend rebuild to pick up the new logic (`docker compose up --build -d backend`).

## 5. Next Step Logic
- **Verification**: Restart the backend container. Open the application, authenticate successfully, and inspect the issued JWT token to ensure the `exp` claim is absent.
