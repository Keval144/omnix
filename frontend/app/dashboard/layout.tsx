import { ThemeSwitch } from "@/components/common/theme-switch";
import { BreadcrumbNav } from "@/components/common/breadcrumb-nav";
import SidebarWrapperClient from "@/components/chats/sidebar-provider";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session?.user;

  if ((user as any).role === "admin") {
    redirect("/dashboard");
  }

  const safeUser = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    avatar: user?.image ?? "/assets/pfp.jpg",
  };

  return (
    <SidebarWrapperClient defaultOpen={defaultOpen} user={safeUser}>
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <BreadcrumbNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitch variant={"link"} />
          </div>
        </header>
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="flex flex-1 min-h-0 flex-col rounded-lg overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarWrapperClient>
  );
}

export default DashboardLayout;
