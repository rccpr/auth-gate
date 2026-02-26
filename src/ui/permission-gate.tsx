import type { JSX, ReactNode } from "react";
import { useAuth } from "../context/auth.context";

/**
 * Props for the PermissionGate component.
 */
type PermissionGateProps = {
	/** Content to render when the user has the required permission(s) */
	children: ReactNode;
	/** Permission(s) required to view the content. Can be a single permission or an array */
	permission: string | string[];
	/** Organization/team ID for permission scoping */
	organizationId: string;
	/** Optional content to render when the user doesn't have permission or is not authenticated */
	fallback?: ReactNode;
	/**
	 * If true, requires all permissions in the array. If false, requires at least one.
	 * @default false
	 */
	requireAll?: boolean;
};

/**
 * A gate component that conditionally renders content based on user permissions.
 * Checks if the authenticated user has specific permission(s) before rendering children.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGate permission="admin">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * // Single permission scoped to organization
 * <PermissionGate permission="admin" organizationId="org_123">
 *   <OrganizationAdminPanel />
 * </PermissionGate>
 *
 * // Multiple permissions - requires at least one
 * <PermissionGate permission={["admin", "moderator"]} organizationId="org_123">
 *   <ModerationTools />
 * </PermissionGate>
 *
 * // Multiple permissions - requires all
 * <PermissionGate permission={["admin", "billing"]} requireAll organizationId="org_123">
 *   <BillingAdminPanel />
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate
 *   permission="editor"
 *   fallback={<div>You need editor permissions</div>}
 *   organizationId="org_123"
 * >
 *   <Editor />
 * </PermissionGate>
 * ```
 */
export const PermissionGate = ({
	children,
	permission,
	organizationId,
	fallback,
	requireAll = false,
}: PermissionGateProps): JSX.Element => {
	const { hasPermission, isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<>{fallback ?? <span>You do not have access to this content.</span>}</>
		);
	}

	const permissions = Array.isArray(permission) ? permission : [permission];

	const hasRequiredPermissions = requireAll
		? permissions.every((p) => hasPermission(p, organizationId))
		: permissions.some((p) => hasPermission(p, organizationId));

	if (!hasRequiredPermissions) {
		return (
			<>
				{fallback ?? (
					<div>
						You do not have the necessary permissions to view this content.
					</div>
				)}
			</>
		);
	}

	return <>{children}</>;
};
