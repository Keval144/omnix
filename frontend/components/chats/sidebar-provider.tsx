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
import { MessageSquare, LayoutDashboard, Settings, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "../common/logo";
import { useState, useEffect } from "react";
import { authenticatedJsonFetch } from "@/lib/api-client";
import { Input } from "@/components/shadcn-ui/input";
import { NewChatModal } from "./new-chat-modal";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";

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
  }, [pathname]); // Refresh when navigating

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  const filteredProjects = projects.filter((p) => {
    const name = p.metadata?.name || p.project_slug || "Untitled Chat";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarHeader className="h-16 border-b flex  shrink-0 pt-4 ml-2">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <span className="text-lg font-semibold leading-none tracking-tight">
              Omnix
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-0 overflow-hidden">
          {/* Static Top Links */}
          <div className="p-2 pl-4 border-b">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.url && !currentProjectId}>
                   <Link href={item.url} className="flex items-center gap-2 ml-1">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                   </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          {/* New Chat Button */}
          <div className="p-4 flex flex-col gap-4">
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

          <ScrollArea className="flex-1 px-4">
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
                    const itemName = p.metadata?.name || p.project_slug || "Untitled Chat";
                    return (
                      <SidebarMenuItem key={p.project_id}>
                        <SidebarMenuButton 
                          
                          isActive={pathname === "/dashboard/chat" && currentProjectId === p.project_id}
                          className="h-9"
                        >
                          <Link href={`/dashboard/chat?project_id=${p.project_id}`} className="flex items-center gap-2 w-full">
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
        <SidebarFooter>
          <div className="flex items-center gap-3 p-3 border-t">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm leading-tight">
              <span className="font-semibold truncate w-[140px]">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate w-[140px]">
                {user.email}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      {children}
    </SidebarProvider>
  );
}
