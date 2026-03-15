import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function checkRole(role: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userRole = (session?.user as { role?: string | string[] } | undefined)
    ?.role;
  if (Array.isArray(userRole)) {
    return userRole.includes(role);
  }
  return userRole === role;
}
