import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import type { UserResource } from "@clerk/types";
import { AuthenticatedGate, useAuth } from "@rccpr/auth-gate";
import { AuthGateProvider } from "./auth";

function GatedContent() {
  const { user, isAuthenticated } = useAuth<UserResource>();

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>auth-gate integration</h2>

      <section
        style={{
          border: "1px solid #333",
          borderRadius: 8,
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <h3>AuthenticatedGate</h3>
        <AuthenticatedGate
          fallback={
            <p style={{ color: "#f87171" }}>
              ⛔ You are <strong>not signed in</strong>. This content is hidden
              by AuthenticatedGate.
            </p>
          }
        >
          <p style={{ color: "#4ade80" }}>
            ✅ You <strong>are signed in</strong>! AuthenticatedGate is showing
            this content.
          </p>
        </AuthenticatedGate>
      </section>

      <section
        style={{
          border: "1px solid #333",
          borderRadius: 8,
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <h3>useAuth() hook</h3>
        <pre
          style={{
            background: "#1e1e2e",
            padding: "1rem",
            borderRadius: 4,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              isAuthenticated,
              userId: user?.id ?? null,
              name: user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : null,
              email: user?.emailAddresses?.[0]?.emailAddress ?? null,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </div>
  );
}

export function App() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "2rem auto",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        background: "#0f172a",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>@rccpr/auth-gate · Clerk Example</h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: 6,
                border: "none",
                background: "#6366f1",
                color: "white",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <AuthGateProvider>
        <GatedContent />
      </AuthGateProvider>
    </div>
  );
}
