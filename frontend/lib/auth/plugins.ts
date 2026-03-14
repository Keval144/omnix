import { nextCookies } from "better-auth/next-js";
import { admin, jwt } from "better-auth/plugins";

export const authPlugins = [
  nextCookies(),
  admin({
    defaultRole: "user",
    adminRoles: ["admin"],
  }),
  jwt(),
];
