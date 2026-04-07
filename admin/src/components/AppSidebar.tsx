import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Package,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const commercialItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Quotations", url: "/quotations", icon: FileText },
  { title: "Sales Orders", url: "/sales-orders", icon: ShoppingCart },
];

const catalogItems = [
  { title: "Products", url: "/products", icon: Package },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const renderItems = (items: typeof commercialItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="hover:bg-primary/10 transition-all duration-300 rounded-lg mx-2 py-6"
            activeClassName="bg-primary/10 text-primary font-bold shadow-sm"
          >
            <item.icon className="mr-3 h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm tracking-wide">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-sidebar/80 backdrop-blur-xl">
      <SidebarContent>
        <div className="px-6 py-8">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 duration-300">
                <span className="text-primary-foreground font-display font-bold text-lg">P</span>
              </div>
              <div>
                <p className="text-base font-display font-bold text-sidebar-foreground tracking-tight">PaintShop <span className="text-primary italic">Pro</span></p>
                <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-medium">Architectural Systems</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 duration-300">
                <span className="text-primary-foreground font-display font-bold text-lg">P</span>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Commercial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(commercialItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(catalogItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
