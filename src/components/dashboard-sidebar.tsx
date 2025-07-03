
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Newspaper,
  Layers,
  BrainCircuit,
  Paintbrush,
  CalendarDays,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/content-generation",
    label: "Content Generation",
    icon: Newspaper,
  },
  {
    href: "/differentiated-materials",
    label: "Differentiated Materials",
    icon: Layers,
  },
  {
    href: "/knowledge-base",
    label: "Knowledge Base",
    icon: BrainCircuit,
  },
  {
    href: "/visual-aids",
    label: "Visual Aids",
    icon: Paintbrush,
  },
  {
    href: "/lesson-planner",
    label: "Lesson Planner",
    icon: CalendarDays,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Sahayak AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                  }}
                  className={cn(
                    "justify-start",
                    pathname === item.href &&
                      "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <a>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
