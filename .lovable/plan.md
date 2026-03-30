

## Analysis

The current system has a **temporary** lockout: after 5 failed attempts, the account is locked for 15 minutes, then auto-unlocks. There is no IP tracking, no permanent lock, and no admin unlock mechanism.

The user wants: permanent lockout after too many failed attempts, with IP logging, visible in the admin panel, and manual unlock by another admin.

## Plan

### 1. Backend: New `login_attempts` table and login logic changes

**New table** `login_attempts` to log each failed attempt with IP address:
- `id`, `email` (attempted), `ip_address`, `attempted_at`

**Modify `backend/routes/auth.js`**:
- Change lockout behavior: when `locked_until` is set to a far-future date (e.g., year 9999) or add a new `is_locked` boolean column to `users`, the account stays locked permanently until an admin unlocks it.
- On each failed attempt, insert a row into `login_attempts` with the IP (`req.ip` or `x-forwarded-for`).
- Keep the 5-attempt threshold but instead of a 15-min lock, set a permanent lock flag.
- When locked, return a message like "Cuenta bloqueada por seguridad. Contacta con un administrador."

**Add columns to `users` table**: `is_locked BOOLEAN DEFAULT FALSE` (simpler than using `locked_until` with magic dates).

### 2. Backend: New endpoints for admin lock management

**Add to `backend/routes/users.js`**:
- `GET /api/users/locked` — list locked accounts with their recent failed login attempts (email, IP, timestamp).
- `PUT /api/users/:id/unlock` — unlock a user account (reset `is_locked`, `failed_login_attempts`).

### 3. Frontend API: Add new methods

**In `src/lib/api.ts`**, add to `usersApi`:
- `listLocked(token)` — fetch locked accounts with attempt details.
- `unlock(id, token)` — unlock a user.

### 4. Frontend: Add "Cuentas Bloqueadas" section to PanelUsuarios

**In `src/pages/panel/PanelUsuarios.tsx`**:
- Add a new section/tab showing locked accounts.
- Each locked account shows: user name, email, last IP addresses that attempted login, timestamps.
- "Desbloquear" button per account that calls the unlock endpoint.
- Visual indicator (badge/icon) on locked accounts in the main user list too.

### 5. Login page: Better error handling

**In `src/pages/panel/PanelLogin.tsx`**:
- Handle HTTP 423 responses specifically to show the "account locked" message from the server instead of the generic "Credenciales inválidas".

### Files to modify
- `backend/routes/auth.js` — permanent lock + IP logging
- `backend/routes/users.js` — unlock endpoint + locked users list
- `src/lib/api.ts` — new API methods
- `src/pages/panel/PanelUsuarios.tsx` — locked accounts UI section
- `src/pages/panel/PanelLogin.tsx` — proper 423 error display

### Database changes needed
- Add `is_locked` column to `users` table
- Create `login_attempts` table

