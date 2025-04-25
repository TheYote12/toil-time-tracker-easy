
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { list, clock, fileText } from "lucide-react";
import { useFakeAuth } from "@/mockData";

const navItems = [
  { title: "Dashboard", icon: list, to: "/dashboard" },
  { title: "Log Extra Hours", icon: clock, to: "/log-extra-hours" },
  { title: "Request TOIL", icon: fileText, to: "/request-toil" },
  { title: "Approvals", icon: list, to: "/approvals", managerOnly: true },
  { title: "TOIL History", icon: clock, to: "/toil-history" },
];

export function AppSidebar() {
  const { role, setRole } = useFakeAuth();
  const loc = useLocation();

  return (
    <Sidebar className="border-r bg-white shadow min-h-screen">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-gray-500 tracking-wide">TOIL Time Tracker</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => !(item.managerOnly && role !== "manager"))
                .map((item) => (
                  <SidebarMenuItem key={item.title} className={loc.pathname === item.to ? "bg-purple-100" : ""}>
                    <SidebarMenuButton asChild>
                      <Link to={item.to} className="flex items-center gap-3 py-2 px-2 rounded group">
                        <item.icon size={20} className="text-purple-500" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs mt-8">Demo: User Role</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex gap-2 px-3 mt-1">
              <button onClick={() => setRole("employee")} className={`px-3 py-1 rounded text-xs ${role === "employee" ? "bg-violet-600 text-white" : "bg-gray-200"}`}>Employee</button>
              <button onClick={() => setRole("manager")} className={`px-3 py-1 rounded text-xs ${role === "manager" ? "bg-violet-600 text-white" : "bg-gray-200"}`}>Manager</button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
