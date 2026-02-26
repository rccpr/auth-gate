import type { JSX, ReactNode } from "react";
import { useAuth } from "../context/auth.context";

/**
 * Props for the ProtectedOrg component.
 */
type ProtectedOrgProps = {
	/** Content to render when the user has the required organization role(s) */
	children: ReactNode;
	/** Organization/team ID for role scoping */
	organizationId: string;
	/** Role(s) required to view the organization content. Can be a single role or an array */
	role: string | string[];
	/** Optional content to render when access is denied. If not provided, shows default messages */
	fallback?: ReactNode;
	/**
	 * If true, requires all roles in the array. If false, requires at least one.
	 * @default false
	 */
	requireAll?: boolean;
};

/**
 * A specialized gate component for organization/team-based content protection.
 * Requires authentication and an organizationId prop to check roles within that organization.
 * Renders content only if the user has the required roles within that organization.
 *
 * This component is specifically designed for multi-tenant or team-based applications
 * where roles are scoped to specific organizations/teams.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * // In a component - protect org content
 * <ProtectedOrg organizationId="org_123" role="admin">
 *   <OrganizationSettings />
 * </ProtectedOrg>
 *
 * // Multiple roles - requires at least one
 * <ProtectedOrg organizationId="org_123" role={["admin", "owner"]}>
 *   <DangerZone />
 * </ProtectedOrg>
 *
 * // Multiple roles - requires all
 * <ProtectedOrg organizationId="org_123" role={["billing", "admin"]} requireAll>
 *   <BillingSettings />
 * </ProtectedOrg>
 *
 * // With custom fallback
 * <ProtectedOrg
 *   organizationId="org_123"
 *   role="member"
 *   fallback={<InviteToOrgBanner />}
 * >
 *   <TeamDashboard />
 * </ProtectedOrg>
 * ```
 */
export const ProtectedOrgGate = ({
	children,
	organizationId,
	role,
	fallback,
	requireAll = false,
}: ProtectedOrgProps): JSX.Element => {
	const { hasRole, isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<>{fallback ?? <span>You do not have access to this content.</span>}</>
		);
	}

	const roles = Array.isArray(role) ? role : [role];

	const hasRequiredRoles = requireAll
		? roles.every((r) => hasRole(r, organizationId))
		: roles.some((r) => hasRole(r, organizationId));

	if (!hasRequiredRoles) {
		return (
			<>
				{fallback ?? (
					<span>You do not have the necessary roles to view this content.</span>
				)}
			</>
		);
	}

	return <>{children}</>;
};
