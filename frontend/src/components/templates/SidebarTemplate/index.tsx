"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getAuthStatus, revokeAuthSession } from "@/lib/api/auth";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import {
  CalendarIcon,
  EditIcon,
  LogOutIcon,
  PlugIcon,
  SettingsIcon,
  StarIcon,
  TargetIcon,
  UserPlusIcon,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";

interface SidebarTemplateProps {
  children: React.ReactNode;
}

export const SidebarTemplate = ({ children }: SidebarTemplateProps): React.JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();

  const [username, setUsername] = React.useState<string | null>(null);
  const [group, setGroup] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    const getAuth = async (): Promise<void> => {
      try {
        const response = await getAuthStatus();
        if (response.error_codes.length > 0 || !response.username) {
          routerPush(rr.signin.index(pathname), router);
          return;
        }
        setUsername(response.username);
        setGroup(response.group);
        setIsLoading(false);
      } catch {
        routerPush(rr.signin.index(pathname), router);
      }
    };

    void getAuth();
  }, [router, pathname]);

  const handleSignOut = async (): Promise<void> => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const response = await revokeAuthSession();
      if (response.error_codes.length > 0) {
        toast.error("Failed to sign out");
        return;
      }
      toast.success("Signed out successfully");
      routerPush(rr.index(), router);
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const hostNavItems = username
    ? [
        {
          title: "Edit Events",
          url: rr.events.edit.index().href,
          icon: EditIcon,
        },
        {
          title: "Integrations",
          url: rr.settings.integrations.index().href,
          icon: PlugIcon,
        },
        {
          title: "Invite Users",
          url: rr.invite.index(username).href,
          icon: UserPlusIcon,
        },
      ]
    : [];

  const guestNavItems = [
    {
      title: "Attend Events",
      url: rr.events.attend.index().href,
      icon: CalendarIcon,
    },
    {
      title: "Goals",
      url: rr.events.goals.index().href,
      icon: TargetIcon,
    },
    {
      title: "Reviews",
      url: rr.events.reviews.index().href,
      icon: StarIcon,
    },
    {
      title: "Subscriptions",
      url: rr.subscriptions.index().href,
      icon: SettingsIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-[100dvh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full">
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <Link {...rr.index()}>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Image src="/logo.svg" alt="Home" width={32} height={32} />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Tend Attend</span>
                      <span className="text-xs">Event Management</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {group === "HOST" && (
              <SidebarGroup>
                <SidebarGroupLabel>For Hosts</SidebarGroupLabel>
                <SidebarSeparator />
                <SidebarGroupContent>
                  <SidebarMenu>
                    {hostNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            <SidebarGroup>
              <SidebarGroupLabel>For Guests</SidebarGroupLabel>
              <SidebarSeparator />
              <SidebarGroupContent>
                <SidebarMenu>
                  {guestNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} disabled={isSigningOut}>
                  <LogOutIcon />
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <main className="flex flex-1 flex-col overflow-auto">
          <div className="container mx-auto flex max-w-[1200px] flex-1 px-4 py-12 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
