"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/shadcn-ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import {
  MessageSquare,
  LayoutDashboard,
  Search,
  Loader2,
  LogOut,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "../common/logo";
import { useState, useEffect } from "react";
import { authenticatedJsonFetch } from "@/lib/api-client";
import { Input } from "@/components/shadcn-ui/input";
import { NewChatModal } from "./new-chat-modal";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn-ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";

type Project = {
  project_id: string;
  project_slug: string;
  metadata?: { name?: string; description?: string };
  created_at: string;
};

export default function SidebarWrapperClient({
  defaultOpen,
  user,
  children,
}: {
  defaultOpen: boolean;
  user: { name: string; email: string; avatar: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProjectId = searchParams.get("project_id");
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await authenticatedJsonFetch<Project[]>("/projects");
      setProjects(data);
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [pathname]);

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  const filteredProjects = projects.filter((p) => {
    const name = p.metadata?.name || p.project_slug || "Untitled Chat";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarHeader className=" flex h-16 shrink-0 border-b pt-4">
          <div className="flex items-center gap-2  pl-3">
            <Logo size={30} />
            <span className="text-lg font-semibold leading-none tracking-tight">
              Omnix
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-0">
          {/* Static Top Links */}
          <div className="border-b p-2 pl-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url && !currentProjectId}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          {/* New Chat Button */}
          <div className="flex flex-col gap-4 p-4">
            <NewChatModal onChatCreated={fetchProjects} />

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="w-full bg-background pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-4">
            <div className="flex flex-col gap-1 pb-4">
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
                Recent Chats
              </span>

              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No chats found
                </div>
              ) : (
                <SidebarMenu>
                  {filteredProjects.map((p) => {
                    const itemName =
                      p.metadata?.name || p.project_slug || "Untitled Chat";

                    return (
                      <SidebarMenuItem key={p.project_id} className="mb-1">
                        <SidebarMenuButton
                          isActive={
                            pathname === "/dashboard/chat" &&
                            currentProjectId === p.project_id
                          }
                          className="h-7.5 px-2"
                        >
                          <Link
                            href={`/dashboard/chat?project_id=${p.project_id}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{itemName}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                {/* Trigger */}
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/50 transition"
                  >
                    <Avatar className="h-9 w-9 rounded-lg">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col text-left text-sm leading-tight flex-1 min-w-0">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>

                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 rotate-90" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* Dropdown */}
                <DropdownMenuContent
                  side="top"
                  className="w-60 rounded-xl border shadow-lg p-1"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-9 w-9 rounded-lg">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col text-sm leading-tight">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border my-1" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer "
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      {children}
    </SidebarProvider>
  );
}
