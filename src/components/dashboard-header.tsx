"use client";

import { useSession, signOut } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  description: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-auto items-start justify-between gap-4 border-b bg-card p-4 sm:h-14 sm:items-center sm:p-6 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div>
          <h1 className="font-headline text-lg font-semibold md:text-2xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {session && (
        <div className="flex items-center gap-4 whitespace-nowrap">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Welcome, {session.user?.name}
          </p>
          <Button variant="destructive" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      )}
    </header>
  );
}
