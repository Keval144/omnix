import { ThemeSwitch } from "@/components/common/theme-switch";
import SidebarWrapperClient from "@/components/chats/sidebar-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { Separator } from "@/components/shadcn-ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

async function ChatLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");
  const user = session?.user;

  if ((user as any).role === "admin") redirect("/dashboard");
  const safeUser = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    avatar: user?.image ?? "/assets/pfp.jpg",
  };

  return (
    <>
      <SidebarWrapperClient defaultOpen={defaultOpen} user={safeUser}>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chats</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* ðŸŒ™ Right-side Theme Switch */}
            <div className="ml-auto flex items-center gap-2">
              <ThemeSwitch variant={"link"} />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-3 pt-0 sm:p-4 sm:pt-0">
            <div className="border-t">
              <div className="p-5">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarWrapperClient>
    </>
  );
}

export default ChatLayout;
