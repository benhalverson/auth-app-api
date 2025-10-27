import { Hono } from "hono";
import { cors } from "hono/cors";
import {logger} from "hono/logger";
import { createAuth } from "../lib/auth";
import type { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();


app.use(logger());
app.use(
  cors({
    origin: [
      'http://localhost:5173',

    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Helper function to verify session
async function getSession(c: AppContext) {
  const auth = createAuth(c.env.users);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return session;
}

// Sign up endpoint
app.post("/api/sign-up", async (c) => {
  const auth = createAuth(c.env.users);
  const body = await c.req.json<{
    email: string;
    password: string;
    name: string;
  }>();

  const { email, password, name } = body;

  if (!email || !password || !name) {
    return c.json({ error: "Email, password, and name are required" }, 400);
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    return c.json({
      message: "User created successfully",
      user: result.user,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign up failed";
    return c.json({ error: errorMessage }, 400);
  }
});

// Sign in endpoint
app.post("/api/sign-in", async (c) => {
  const auth = createAuth(c.env.users);
  const body = await c.req.json<{
    email: string;
    password: string;
  }>();

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    return c.json({
      message: "Signed in successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign in failed";
    return c.json({ error: errorMessage }, 401);
  }
});

// Sign out endpoint
app.post("/api/sign-out", async (c) => {
  const auth = createAuth(c.env.users);

  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json({ message: "Signed out successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign out failed";
    return c.json({ error: errorMessage }, 400);
  }
});

// Get current user endpoint
app.get("/api/me", async (c) => {
  const session = await getSession(c);

  if (!session?.user) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  return c.json({
    user: session.user,
    session: {
      expiresAt: session.session.expiresAt,
    },
  });
});

// Protected route example
app.get("/api/protected", async (c) => {
  const session = await getSession(c);

  if (!session?.user) {
    return c.json({ error: "Unauthorized - Please sign in" }, 401);
  }

  return c.json({
    message: `Hello ${session.user.name}! This is a protected route.`,
    user: session.user,
  });
});

// Better-auth handler for any additional auth endpoints
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const auth = createAuth(c.env.users);
  return auth.handler(c.req.raw);
});

export default app;
