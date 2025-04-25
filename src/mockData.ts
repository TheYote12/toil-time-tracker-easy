// Enhanced Demo Data Types and Data

import React from "react";

export type Role = "employee" | "manager" | "admin";
export interface User {
  id: string;
  name: string;
  role: Role;
  team?: string[];
}
export interface ToilSubmission {
  id: string;
  userId: string;
  type: "earn" | "use";
  date: string;
  project?: string;
  startTime?: string;
  endTime?: string;
  weekend?: boolean;
  amount: number; // in minutes
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
  approverNote?: string;
}

// DEMO USERS
export const demoUsers: User[] = [
  {
    id: "e-1",
    name: "Alice Employee",
    role: "employee",
    team: [],
  },
  {
    id: "e-2",
    name: "Bob Brown",
    role: "employee",
    team: [],
  },
  {
    id: "e-3",
    name: "Clara Cook",
    role: "employee",
    team: [],
  },
  {
    id: "m-1",
    name: "Megan Manager",
    role: "manager",
    team: ["e-1", "e-2", "e-3"],
  },
  {
    id: "m-2",
    name: "Michael Manager",
    role: "manager",
    team: ["e-4"],
  },
  {
    id: "e-4",
    name: "Danielle Developer",
    role: "employee",
    team: [],
  },
];

// DEMO AUTH HOOK
export function useFakeAuth() {
  const [role, setRole] = React.useState<Role>("employee");
  const [user, setUser] = React.useState<User>(demoUsers[0]);

  React.useEffect(() => {
    // Only update user if the role changed and user/role is mismatched
    if (user.role !== role) {
      const firstMatch = demoUsers.find((u) => u.role === role) || demoUsers[0];
      setUser(firstMatch);
    }
  }, [role]);

  // Support explicit setUser (for demo user picker)
  return { user, role, setRole, setUser };
}

// ENHANCED DEMO TRANSACTIONS (WITH userId)
export const demoToilSubmissions: ToilSubmission[] = [
  // Alice: e-1
  {
    id: "sub-1",
    userId: "e-1",
    type: "earn",
    date: "2024-04-20",
    project: "Client X Rollout",
    startTime: "09:05",
    endTime: "19:02",
    weekend: false,
    amount: 600,
    status: "Pending",
    notes: "Go-live deployment ran long.",
  },
  {
    id: "sub-2",
    userId: "e-1",
    type: "use",
    date: "2024-04-22",
    amount: 240,
    status: "Approved",
    notes: "Afternoon medical appointment.",
  },
  {
    id: "sub-3",
    userId: "e-1",
    type: "earn",
    date: "2024-04-14",
    project: "Internal Update",
    startTime: "10:00",
    endTime: "14:15",
    weekend: true,
    amount: 255,
    status: "Approved",
    notes: "Quarterly meeting (weekend)",
  },
  // Bob: e-2
  {
    id: "sub-4",
    userId: "e-2",
    type: "earn",
    date: "2024-04-18",
    project: "Major Incident",
    startTime: "21:00",
    endTime: "01:00",
    weekend: false,
    amount: 240,
    status: "Approved",
    notes: "Overnight troubleshooting",
  },
  {
    id: "sub-5",
    userId: "e-2",
    type: "use",
    date: "2024-04-19",
    amount: 60,
    status: "Rejected",
    notes: "Short request for personal time",
  },
  // Clara: e-3
  {
    id: "sub-6",
    userId: "e-3",
    type: "earn",
    date: "2024-04-17",
    project: "Planned Maintenance",
    startTime: "06:00",
    endTime: "09:00",
    weekend: true,
    amount: 180,
    status: "Pending",
    notes: "Early maintenance window",
  },
  // Danielle: e-4
  {
    id: "sub-7",
    userId: "e-4",
    type: "use",
    date: "2024-04-16",
    amount: 120,
    status: "Approved",
    notes: "Family event",
  },
  {
    id: "sub-8",
    userId: "e-4",
    type: "earn",
    date: "2024-04-10",
    project: "Security Patch",
    startTime: "20:00",
    endTime: "22:00",
    weekend: false,
    amount: 120,
    status: "Approved",
    notes: "Late deployment",
  },
  // Manager Megan logs own extra hours
  {
    id: "sub-9",
    userId: "m-1",
    type: "earn",
    date: "2024-03-27",
    project: "After hours review",
    startTime: "17:20",
    endTime: "19:20",
    weekend: false,
    amount: 120,
    status: "Approved",
    notes: "Supporting project B",
  },
];

// Calculate Balance (approved only)
export function calculateToilBalance(subs: ToilSubmission[]) {
  let balance = 0;
  for (const sub of subs) {
    if (sub.status !== "Approved") continue;
    if (sub.type === "earn") balance += sub.amount;
    if (sub.type === "use") balance -= sub.amount;
  }
  return balance;
}

// Minutes to H:MM
export function minToHM(minutes: number) {
  if (minutes < 0) return `0:00`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
