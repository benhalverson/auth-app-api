# Testing Guide

This project uses **Vitest** for unit and integration testing with a **TDD (Test-Driven Development)** approach.

## Setup

### Prerequisites
- Node.js 18+
- pnpm

### Installation

Tests are configured as part of the development dependencies. After cloning:

```bash
pnpm install
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode (for development)
```bash
pnpm test -- --watch
```

### Run tests with UI dashboard
```bash
pnpm test:ui
```

This opens an interactive test dashboard at `http://localhost:51204/__vitest__/`

### Run tests with coverage
```bash
pnpm test:coverage
```

Coverage report will be generated in `coverage/` directory.

### Run specific test file
```bash
pnpm test tests/unit/schema.test.ts
```

### Run tests matching pattern
```bash
pnpm test -- --grep "sign-up"
```

## Test Structure

Tests are organized by type:

```
tests/
├── unit/
│   ├── auth.config.test.ts      # Auth configuration validation
│   └── schema.test.ts            # Database schema validation
├── integration/
│   ├── auth-endpoints.test.ts    # Sign-up, sign-in, sign-out
│   ├── session.test.ts           # Session management
│   └── protected-routes.test.ts  # Authorization & RBAC
└── fixtures/
    └── test-data.ts             # Test data & helpers
```

## Test Categories

### Unit Tests

**What they test:**
- Configuration validity
- Schema definitions
- Type checking
- Individual function behavior

**Location:** `tests/unit/`

**Example:**
```bash
pnpm test tests/unit/schema.test.ts
```

### Integration Tests

**What they test:**
- End-to-end authentication flows
- Database interactions
- API endpoint behavior
- Session management
- Authorization checks

**Location:** `tests/integration/`

**Example:**
```bash
pnpm test tests/integration/auth-endpoints.test.ts
```

## Test Data

Common test data and helpers are available in `tests/fixtures/test-data.ts`:

- `testUser` - Standard test user credentials
- `testUserAdmin` - Admin user for RBAC tests
- `testUserBanned` - Banned user for ban testing
- `validEmails` / `invalidEmails` - Email validation data
- `validPasswords` / `invalidPasswords` - Password validation data
- `mockHeaders` - Common header combinations
- Helper functions for making requests and parsing responses

## Environment Setup for Testing

### Local Development Testing

Create a `.dev.vars` file for local testing:

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-for-testing
```

### CI/CD Testing

Tests should run in CI with appropriate environment variables set. The test configuration uses Miniflare to simulate Cloudflare Workers and D1 locally.

## Test Configuration

The Vitest configuration is in `vitest.config.ts`:

- **Environment**: happy-dom (lightweight DOM for testing)
- **Pool**: @cloudflare/vitest-pool-workers (simulates CF Workers)
- **D1 Simulation**: Miniflare handles local SQLite D1 emulation
- **Coverage**: v8 provider with HTML reports

## Writing Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  describe('Specific behavior', () => {
    beforeEach(async () => {
      // Setup for each test
    });

    afterEach(async () => {
      // Cleanup after each test
    });

    it('should do something specific', async () => {
      // Arrange
      const input = testData;

      // Act
      const result = await functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Best Practices

1. **Descriptive names**: Test names should clearly describe what is being tested
2. **AAA Pattern**: Arrange, Act, Assert
3. **One assertion per test** (when possible)
4. **Use fixtures**: Leverage `tests/fixtures/test-data.ts` for common data
5. **Async handling**: Use `async/await` for async operations
6. **Isolate tests**: Each test should be independent

### Example Test

```typescript
it('should successfully sign up a new user', async () => {
  // Arrange
  const { email, password, name } = testUser;

  // Act
  const response = await makeRequest(app, 'POST', '/api/sign-up', {
    body: { email, password, name },
  });
  const result = await parseResponse(response);

  // Assert
  expect(result.status).toBe(200);
  expect(result.data.user).toHaveProperty('id');
  expect(result.data.user.email).toBe(email);
});
```

## Debugging Tests

### Debug mode
```bash
pnpm test -- --inspect-brk
```

Then open `chrome://inspect` in Chrome DevTools.

### Verbose output
```bash
pnpm test -- --reporter=verbose
```

### Stop on first failure
```bash
pnpm test -- --bail
```

## Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
pnpm test:coverage
open coverage/index.html
```

## Common Issues

### Tests timeout
Increase timeout:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### D1 database not available
Ensure miniflare is configured and running in test pool. Check `vitest.config.ts`.

### Import errors
Verify file paths and ensure files are in correct locations. Check tsconfig.json paths.

## Continuous Integration

Tests are configured to run in CI/CD pipelines:

```bash
pnpm install
pnpm test
pnpm test:coverage
```

Consider adding:
- Pre-commit hooks to run tests
- GitHub Actions workflow for automated testing
- Coverage reporting to services like Codecov

## Next Steps

1. **Run tests**: `pnpm test` to see current status
2. **Implement code**: Write code to make tests pass
3. **Expand tests**: Add more test cases as features are added
4. **Monitor coverage**: Aim for > 80% code coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
- [Better-Auth Documentation](https://www.better-auth.com/)
