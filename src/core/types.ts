export const decisionStatuses = [
	"allowed",
	"denied",
	"pending",
	"error",
] as const;

export type DecisionStatus = (typeof decisionStatuses)[number];

export type DecisionState<T = boolean> = {
	status: DecisionStatus;
	data?: T;
	error?: unknown;
};

export type AuthState<TUser> = {
	user: TUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error?: unknown;
};

export type ConflictPolicy = "strict" | "optimistic";
