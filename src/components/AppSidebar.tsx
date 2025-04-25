
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import SidebarProfile from "./SidebarProfile";
import SidebarNav from "./SidebarNav";
import SidebarThemeToggle from "./SidebarThemeToggle";

export function AppSidebar() {
  return (
    <Sidebar className="border-r bg-white shadow min-h-screen" aria-label="Sidebar navigation">
      <SidebarContent>
        <SidebarGroup>
          <SidebarProfile />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarNav />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarThemeToggle />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
