import type { JSX, ReactNode } from "react";
import { useAuth } from "../context/auth.context";

/**
 * Props for the AuthenticatedGate component.
 */
type AuthenticatedGateProps = {
	/** Content to render when the user is authenticated */
	children: ReactNode;
	/** Optional content to render when the user is not authenticated */
	fallback?: ReactNode;
};

/**
 * A gate component that conditionally renders content based on authentication status.
 * Renders children only if the user is authenticated, otherwise renders the fallback.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * // Simple usage - hides content if not authenticated
 * <AuthenticatedGate>
 *   <Dashboard />
 * </AuthenticatedGate>
 *
 * // With fallback content
 * <AuthenticatedGate fallback={<LoginPage />}>
 *   <Dashboard />
 * </AuthenticatedGate>
 * ```
 */
export const AuthenticatedGate = ({
	children,
	fallback,
}: AuthenticatedGateProps): JSX.Element => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <>{fallback ?? null}</>;
	}

	return <>{children}</>;
};
