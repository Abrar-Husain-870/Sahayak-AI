import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  title: string;
  description: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
