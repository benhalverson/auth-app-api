# Better-Auth Setup Guide

## Authentication Endpoints

The app now has better-auth integrated with username/password authentication. All auth endpoints are available at `/api/auth/*`.

## Available Endpoints

### Authentication Endpoints
- **Sign Up**: `POST /api/sign-up`
- **Sign In**: `POST /api/sign-in`
- **Sign Out**: `POST /api/sign-out`
- **Get Current User**: `GET /api/me`
- **Protected Route Example**: `GET /api/protected`

### Better-Auth Native Endpoints
You can also use the native better-auth endpoints at `/api/auth/*` if needed.

## Setup Steps

### 1. Configure Environment Secret

You need to set a `BETTER_AUTH_SECRET` for better-auth. Generate a secure random secret:

```bash
# Generate a random secret (use one of these methods)
openssl rand -base64 32

# Or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then set it as a secret:

```bash
# For local development, create a .dev.vars file
echo "BETTER_AUTH_SECRET=your-generated-secret-here" > .dev.vars

# For production, set it using wrangler
wrangler secret put BETTER_AUTH_SECRET
```

### 2. Run Database Migrations

Apply the generated migrations to your D1 database:

```bash
# For local development
wrangler d1 execute users --local --file=./drizzle/0000_same_mysterio.sql

# For production
wrangler d1 execute users --file=./drizzle/0000_same_mysterio.sql
```

### 3. Start Development Server

```bash
npm run dev
```

## Usage Examples

### 1. Sign Up a New User

```bash
curl -X POST http://localhost:8787/api/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

### 2. Sign In

```bash
curl -X POST http://localhost:8787/api/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "session-token-here"
}
```

**Save the token** - you'll need it for authenticated requests!

### 3. Get Current User Info

```bash
curl http://localhost:8787/api/me \
  -H "Authorization: Bearer <your-session-token>"
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "expiresAt": "2025-11-25T12:00:00.000Z"
  }
}
```

### 4. Access Protected Route

```bash
curl http://localhost:8787/api/protected \
  -H "Authorization: Bearer <your-session-token>"
```

Response:
```json
{
  "message": "Hello John Doe! This is a protected route.",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 5. Sign Out

```bash
curl -X POST http://localhost:8787/api/sign-out \
  -H "Authorization: Bearer <your-session-token>"
```

Response:
```json
{
  "message": "Signed out successfully"
}
```

## Database Schema

The setup creates these tables in your D1 database:

- **user**: Stores user information (id, name, email, etc.)
- **session**: Manages user sessions
- **account**: Stores authentication provider data (email/password)
- **verification**: Handles email verification tokens

## Next Steps

- Add email verification
- Implement password reset
- Add OAuth providers (Google, GitHub, etc.)
- Implement role-based access control
- Add rate limiting

## Troubleshooting

### Missing BETTER_AUTH_SECRET

If you see authentication errors, ensure the `BETTER_AUTH_SECRET` is set in your `.dev.vars` file for local development or as a wrangler secret for production.

### Database Errors

Make sure you've run the migrations on your D1 database before testing the endpoints.
