"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  KeyRound,
  FileText,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

type Developer = {
  id: string;
  email: string;
  name: string;
  avatar: string;
};

const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "API Keys",
    url: "/dashboard/api-keys",
    icon: KeyRound,
  },
  {
    title: "Docs",
    url: "/dashboard/docs",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const router = useRouter();

  const [developer, setDeveloper] =
    useState<Developer | null>(null);

  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    const initializeAuth = async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {

          localStorage.removeItem("token");

          router.replace("/auth/login");

          return;
        }

        const data = await response.json();

        setDeveloper(data);

      } catch (error) {

        console.log(error);

        localStorage.removeItem("token");

        router.replace("/auth/login");

      } finally {

        setLoading(false);

      }
    };

    initializeAuth();

  }, [router]);

  const handleLogout = () => {

    localStorage.removeItem("token");

    router.replace("/auth/login");

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider>

      <div className="flex min-h-screen w-full bg-muted/30">

        {/* Sidebar */}
        <Sidebar className="border-r bg-white">

          {/* Header */}
          <SidebarHeader className="h-20 border-b flex justify-center items-center px-6 cursor-pointer">
            <Link href="/">
            <h1 className="text-4xl font-bold tracking-tight">
              Auth
              <span className="text-primary">
                KIT
              </span>
            </h1>
            </Link>

          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="p-4">

            <SidebarMenu>

              {items.map((item) => (

                <SidebarMenuItem
                  key={item.title}
                  className="mb-3"
                >

                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/dashboard"
                        ? pathname === item.url
                        : pathname.startsWith(
                          item.url
                        )
                    }
                  >

                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >

                      <item.icon className="h-5 w-5" />

                      <span className="text-lg">
                        {item.title}
                      </span>

                    </Link>

                  </SidebarMenuButton>

                </SidebarMenuItem>

              ))}

            </SidebarMenu>

          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="border-t p-4">

            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <button className="w-full">

                  <div className="flex items-center justify-between gap-3 border bg-muted/50 p-3 hover:bg-muted transition">

                    <div className="flex items-center gap-3 overflow-hidden">

                      <Avatar className="h-10 w-10">

                        <AvatarImage
                          src={developer?.avatar}
                        />

                        <AvatarFallback>
                          {developer?.name?.charAt(0)}
                        </AvatarFallback>

                      </Avatar>

                      <div className="flex flex-col overflow-hidden text-left">

                        <span className="font-medium truncate">
                          {developer?.name}
                        </span>

                        <span className="text-xs text-muted-foreground truncate">
                          {developer?.email}
                        </span>

                      </div>

                    </div>

                  </div>

                </button>

              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56"
              >

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:text-red-500 text-lg"
                >

                  <LogOut className="mr-2 h-6 w-6" />

                  Logout

                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </SidebarFooter>

        </Sidebar>

        {/* Main Section */}
        <div className="flex flex-1 flex-col">

          {/* Top Navbar */}
          <header className="h-20 border-b bg-white px-8 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Manage your authentication platform.
              </p>

            </div>

            <div className="flex items-center gap-4">

              <Button variant="outline">
                My SaaS App
              </Button>

              <Button className="gap-2">

                <Plus className="h-4 w-4" />

                Create Project

              </Button>

            </div>

          </header>

          {/* Content */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>

        </div>

      </div>

    </SidebarProvider>
  );
}