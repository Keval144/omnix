import { adminClient, jwtClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient(), jwtClient(), lastLoginMethodClient({
    cookieName: "better-auth.last_used_login_method"
  })],
});
