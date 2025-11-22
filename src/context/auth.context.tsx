import { createContext, use, type JSX } from "react";

export interface AuthGateAdapter<U> {
	getUser(): U;
}

export type AuthGateContextType<A extends AuthGateAdapter<unknown>> = {
	adapter: A;
};

type CreateHooksReturn<A extends AuthGateAdapter<unknown>> = {
	useAuth: () => AuthGateContextType<A>;
	AuthGateProvider: ({ children }: { children: React.ReactNode }) => JSX.Element;
};

export const createHooks = <A extends AuthGateAdapter<unknown>>(adapter: A): CreateHooksReturn<A> => {
	const AuthContext = createContext<AuthGateContextType<A>>({
		adapter: adapter,
	});

	const AuthGateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
		return <AuthContext.Provider value={{ adapter }}>{children}</AuthContext.Provider>;
	};

	return {
		useAuth: () => {
			const context = use(AuthContext);
			if (!context) {
				throw new Error("useAuth must be used within an AuthProvider");
			}
			return context;
		},
		 AuthGateProvider,
	};
};


