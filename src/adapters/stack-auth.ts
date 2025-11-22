import type { CurrentUser, useStackApp } from "@stackframe/stack";
import type { AuthGateAdapter } from "../context/auth.context";

export class StackAdapter implements AuthGateAdapter<CurrentUser | null> {
	constructor(private readonly stackAppHook: typeof useStackApp) {}

	getUser(): CurrentUser | null {
		const user = this.stackAppHook().useUser();
		return user;
	}
}
