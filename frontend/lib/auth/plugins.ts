import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const authPlugins = [
	nextCookies(),
	admin({
		defaultRole: "user",
		adminRoles: ["admin"],
	}),
];
