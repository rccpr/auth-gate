import { createContext, use } from "react";

export type User = {
	id: string;
	name: string;
	email: string;
};

export type AuthContextType = {
	user: User | null;
	isLoading: boolean;
	error: Error | null;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	error: null,
});

export function useAuth(): AuthContextType {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
