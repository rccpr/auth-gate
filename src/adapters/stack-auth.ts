import type { CurrentUser, StackClientApp } from "@stackframe/stack";
import type { AuthGateAdapter } from "../context/auth.context";

export class StackAdapter implements AuthGateAdapter<CurrentUser> {
	constructor(private readonly stack: StackClientApp) {}

	async getUser(): Promise<CurrentUser | null> {
		const user = await this.stack.getUser();
		return user;
	}
}
