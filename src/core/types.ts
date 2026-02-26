export const asyncLoadStatuses = [
	"allowed",
	"denied",
	"pending",
	"error",
] as const;

export type AsyncLoadStatus = (typeof asyncLoadStatuses)[number];

export type AsyncLoadState<T = boolean> = {
	status: AsyncLoadStatus;
	data?: T;
	error?: unknown;
};

export type HasCheck<TPermission extends string = string> =
	| { permission: TPermission }
	| { role: string }
	| { feature: string }
	| { plan: string };

export const decisionStatuses: readonly AsyncLoadStatus[] = asyncLoadStatuses;

export type DecisionStatus = AsyncLoadStatus;

export type DecisionState<T = boolean> = AsyncLoadState<T>;

export type AuthState<TUser> = {
	user: TUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error?: unknown;
};

export type ConflictPolicy = "strict" | "optimistic";
