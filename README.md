# Auth App API

A modern, production-ready authentication API built with **Better-Auth**, **Hono**, **Cloudflare Workers**, and **D1 database**.

## Features

✨ **Authentication Methods:**
- Email/Password authentication
- Passkey/WebAuthn support (FIDO2)
- Google One Tap integration
- Account linking
- OAuth provider support

🔐 **Security:**
- Role-based access control (RBAC)
- User banning with expiration
- Session management with IP/User-Agent tracking
- Secure password hashing
- CORS protection

🚀 **Performance:**
- Edge deployment via Cloudflare Workers
- SQLite database with D1
- Experimental database joins optimization
- Minimal payload sizes

🧪 **Developer Experience:**
- 120+ comprehensive tests (unit + integration)
- Modern TypeScript with full type safety
- Hot reload development server
- OpenAPI schema generation with interactive UI
- Detailed documentation and examples

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Cloudflare account (for deployment)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd auth-app-api

# Install dependencies
pnpm install

# Setup environment
cp .env.example .dev.vars
# Edit .dev.vars and add your BETTER_AUTH_SECRET
```

### Generate Secret

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated secret to `.dev.vars`:

```env
BETTER_AUTH_SECRET=your-generated-secret-here
```

### Development

```bash
# Start development server (http://localhost:8787)
pnpm run dev

# View interactive API documentation
# Open: http://localhost:8787/api/auth/reference

# Run tests
pnpm test

# Run tests with UI dashboard
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm run deploy
```

## Project Structure

```
auth-app-api/
├── src/
│   ├── index.ts              # Main Hono app & endpoints
│   └── db/
│       └── schema.ts         # Drizzle database schema
├── lib/
│   └── auth.ts               # Better-Auth configuration
├── drizzle/                  # Database migrations
├── tests/                    # Test suite (120+ tests)
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example              # Environment template
├── vitest.config.ts          # Test configuration
├── drizzle.config.ts         # Database configuration
└── TESTING.md                # Testing guide
```

## API Endpoints

### Interactive Documentation

When running the dev server, access the auto-generated API documentation:

**🔗 [http://localhost:8787/api/auth/reference](http://localhost:8787/api/auth/reference)**

This provides a complete interactive API reference with all Better-Auth endpoints, schemas, and the ability to test requests directly from your browser.

### Custom Endpoints

### Sign Up
```bash
POST /api/sign-up
```

### Sign In
```bash
POST /api/sign-in
```

### Get Current User
```bash
GET /api/me
Authorization: Bearer <token>
```

### Sign Out
```bash
POST /api/sign-out
Authorization: Bearer <token>
```

### Protected Route
```bash
GET /api/protected
Authorization: Bearer <token>
```

See [SETUP.md](SETUP.md) for detailed endpoint examples.

## Testing

```bash
pnpm test              # Run all tests
pnpm test:ui          # Interactive dashboard
pnpm test:coverage    # Coverage report
```

120+ tests covering authentication flows, sessions, and authorization.

See [TESTING.md](TESTING.md) for more details.

## Configuration

### Environment Variables

- `BETTER_AUTH_SECRET` - Encryption secret (required, min 32 chars)
- `BETTER_AUTH_URL` - Base URL for redirects
- OAuth credentials (Google, GitHub, etc.)

See `.env.example` for all options.

## Resources

- [Better-Auth Docs](https://www.better-auth.com/)
- [Hono Docs](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)

## License

MIT
