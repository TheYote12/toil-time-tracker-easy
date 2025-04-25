
import { SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { List, Clock, FileText, Users } from "lucide-react";
import { demoUsers } from "@/mockData";
import { useFakeAuth } from "@/contexts/FakeAuthContext";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", icon: List, to: "/dashboard" },
  { title: "Log Extra Hours", icon: Clock, to: "/log-extra-hours" },
  { title: "Request TOIL", icon: FileText, to: "/request-toil" },
  { title: "Approvals", icon: Users, to: "/approvals", managerOnly: true },
  { title: "TOIL History", icon: Clock, to: "/toil-history" },
];

// Demo user login
function UserPicker() {
  const { role, setRole, user, setUser } = useFakeAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Split users by role
  const managers = demoUsers.filter(u => u.role === "manager");
  const employees = demoUsers.filter(u => u.role === "employee");

  // Allow picking from a dropdown
  return (
    <div className="relative px-2 mt-4" aria-label="Switch user (demo)">
      <span className="block text-xs text-gray-500 mb-1">Simulate Login:</span>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="w-full bg-gray-100 px-3 py-1 rounded text-sm flex items-center justify-between"
      >
        <span>
          {user.name} <span className="ml-1 text-xs text-gray-500">({role})</span>
        </span>
        <span className="text-lg">▾</span>
      </button>
      {menuOpen && (
        <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 text-sm max-h-52 overflow-auto">
          <div className="px-2 py-1 text-gray-500 text-xs">Managers</div>
          {managers.map((m) => (
            <div
              key={m.id}
              onClick={() => { setRole("manager"); setUser(m); setMenuOpen(false); }}
              className={`cursor-pointer px-3 py-1 hover:bg-purple-100 ${user.id === m.id ? "bg-purple-200" : ""}`}
            >
              {m.name}
            </div>
          ))}
          <div className="px-2 py-1 text-gray-500 text-xs">Employees</div>
          {employees.map((e) => (
            <div
              key={e.id}
              onClick={() => { setRole("employee"); setUser(e); setMenuOpen(false); }}
              className={`cursor-pointer px-3 py-1 hover:bg-purple-50 ${user.id === e.id ? "bg-purple-100" : ""}`}
            >
              {e.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarNav() {
  const { role } = useFakeAuth();
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
        <UserPicker />
      </SidebarGroupContent>
    </>
  );
}
