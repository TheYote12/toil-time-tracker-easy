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
    name: "Alex Eason",
    role: "manager",
    team: ["e-1", "e-2", "e-3", "e-5", "e-6"],
  },
  {
    id: "m-2",
    name: "Michael Manager",
    role: "manager",
    team: ["e-4", "e-7", "e-8"],
  },
  {
    id: "e-4",
    name: "Danielle Developer",
    role: "employee",
    team: [],
  },
  {
    id: "e-5",
    name: "Emma Edwards",
    role: "employee",
    team: [],
  },
  {
    id: "e-6",
    name: "Frank Fischer",
    role: "employee",
    team: [],
  },
  {
    id: "e-7",
    name: "Grace Green",
    role: "employee",
    team: [],
  },
  {
    id: "e-8",
    name: "Henry Harris",
    role: "employee",
    team: [],
  },
];

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
  
  // Additional submissions for Emma
  {
    id: "sub-10",
    userId: "e-5",
    type: "earn",
    date: "2024-04-15",
    project: "Database Migration",
    startTime: "18:00",
    endTime: "21:00",
    weekend: false,
    amount: 180,
    status: "Approved",
    notes: "Extended system update",
  },
  // Frank's submission
  {
    id: "sub-11",
    userId: "e-6",
    type: "use",
    date: "2024-04-12",
    amount: 240,
    status: "Pending",
    notes: "Personal appointment",
  },
  // Grace's submissions
  {
    id: "sub-12",
    userId: "e-7",
    type: "earn",
    date: "2024-04-08",
    project: "Emergency Hotfix",
    startTime: "20:00",
    endTime: "23:00",
    weekend: false,
    amount: 180,
    status: "Approved",
    notes: "Production issue resolution",
  },
  // Henry's submission
  {
    id: "sub-13",
    userId: "e-8",
    type: "earn",
    date: "2024-04-05",
    project: "Weekend Release",
    startTime: "09:00",
    endTime: "13:00",
    weekend: true,
    amount: 240,
    status: "Pending",
    notes: "Major version deployment",
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
