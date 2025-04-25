
import { SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { List, Clock, FileText, Users } from "lucide-react";
import { useFakeAuth } from "@/mockData";

// Only icons specified in project context may be used.
const navItems = [
  { title: "Dashboard", icon: List, to: "/dashboard" },
  { title: "Log Extra Hours", icon: Clock, to: "/log-extra-hours" },
  { title: "Request TOIL", icon: FileText, to: "/request-toil" },
  { title: "Approvals", icon: Users, to: "/approvals", managerOnly: true },
  { title: "TOIL History", icon: Clock, to: "/toil-history" },
];

export default function SidebarNav() {
  const { role, setRole } = useFakeAuth();
  const loc = useLocation();
  return (
    <>
      <SidebarGroupLabel className="text-xs uppercase text-gray-500 tracking-wide">TOIL Time Tracker</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems
            .filter((item) => !(item.managerOnly && role !== "manager"))
            .map((item) => (
              <SidebarMenuItem key={item.title} className={loc.pathname === item.to ? "bg-purple-100" : ""}>
                <SidebarMenuButton asChild>
                  <Link to={item.to} className="flex items-center gap-3 py-2 px-2 rounded group" aria-current={loc.pathname === item.to ? "page" : undefined}>
                    <item.icon size={20} className="text-purple-500" aria-hidden="true" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
        {/* Role switch for demo */}
        <div className="flex gap-2 px-2 mt-4" aria-label="Switch role (demo)">
          <button onClick={() => setRole("employee")} className={`px-3 py-1 rounded text-xs ${role === "employee" ? "bg-violet-600 text-white" : "bg-gray-200"}`}>Employee</button>
          <button onClick={() => setRole("manager")} className={`px-3 py-1 rounded text-xs ${role === "manager" ? "bg-violet-600 text-white" : "bg-gray-200"}`}>Manager</button>
        </div>
      </SidebarGroupContent>
    </>
  );
}
