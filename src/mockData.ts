
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

export const demoUsers: User[] = [
  {
    id: "e-1",
    name: "Alice Employee",
    role: "employee",
    team: ["e-2", "e-3"],
  },
  {
    id: "m-1",
    name: "Megan Manager",
    role: "manager",
    team: ["e-1", "e-2", "e-3"],
  },
];

// User is hardcoded for demo; in real app will use auth
export function useFakeAuth() {
  const [role, setRole] = React.useState<Role>("employee");
  const [user, setUser] = React.useState<User>(demoUsers[0]);

  React.useEffect(() => {
    setUser(demoUsers.find((u) => u.role === role) || demoUsers[0]);
  }, [role]);

  return { user, role, setRole };
}

// In-memory demo transaction data
export const demoToilSubmissions: ToilSubmission[] = [
  {
    id: "sub-1",
    type: "earn",
    date: "2024-04-20",
    project: "Client X Rollout",
    startTime: "09:05",
    endTime: "19:02",
    weekend: false,
    amount: 600, // 10h, with 2h potential earn
    status: "Pending",
    notes: "Go-live deployment ran long.",
  },
  {
    id: "sub-2",
    type: "use",
    date: "2024-04-22",
    amount: 240, // 4h
    status: "Approved",
    notes: "Afternoon medical appointment.",
  },
  {
    id: "sub-3",
    type: "earn",
    date: "2024-04-14",
    project: "Internal Update",
    startTime: "10:00",
    endTime: "14:15",
    weekend: true,
    amount: 255, // 4h15m
    status: "Approved",
    notes: "Quarterly meeting (weekend)",
  },
];

// Helper to calculate current balance (sum of approved only)
export function calculateToilBalance(subs: ToilSubmission[]) {
  let balance = 0;
  for (const sub of subs) {
    if (sub.status !== "Approved") continue;
    if (sub.type === "earn") balance += sub.amount;
    if (sub.type === "use") balance -= sub.amount;
  }
  return balance;
}

// Utility to format minutes as H:MM
export function minToHM(minutes: number) {
  if (minutes < 0) return `0:00`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
