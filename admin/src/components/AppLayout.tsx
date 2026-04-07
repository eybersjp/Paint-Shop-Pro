import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-3xl overflow-hidden rounded-l-[2rem] my-2 mr-2 shadow-2xl shadow-black/5 ring-1 ring-black/[0.02]">
          <header className="h-16 flex items-center px-8 shrink-0">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
            <div className="ml-auto flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Ready</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
