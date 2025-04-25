import { demoUsers, demoToilSubmissions, minToHM } from "@/mockData";
import { useFakeAuth } from "@/contexts/FakeAuthContext";
import { Users, Clock, FileText, Bell, BarChart2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManagerDashboardPanel() {
  const { user: manager } = useFakeAuth();
  const teamIds = manager.team || [];
  const teamMembers = demoUsers.filter(u => u.role === "employee" && teamIds.includes(u.id));

  // Team Requests
  const teamRequests = demoToilSubmissions.filter(s => teamIds.includes(s.userId));
  const pendingCount = teamRequests.filter(s => s.status === "Pending").length;
  const approvedCount = teamRequests.filter(s => s.status === "Approved").length;
  const rejectedCount = teamRequests.filter(s => s.status === "Rejected").length;

  // Recent requests
  const recentRequests = [...teamRequests].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Per member balance
  const getUserName = (id: string) => demoUsers.find(u => u.id === id)?.name || id;
  const getMemberBalance = (uid: string) => {
    const subs = teamRequests.filter(s => s.userId === uid);
    let balance = 0;
    for (const sub of subs) {
      if (sub.status !== "Approved") continue;
      if (sub.type === "earn") balance += sub.amount;
      if (sub.type === "use") balance -= sub.amount;
    }
    return balance;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-700">Manager Team Overview</h3>
      </div>
      <div className="text-blue-900 mb-1 text-xs">
        Track your team's current TOIL status at a glance and review recent activity.
      </div>

      {/* Team member summary */}
      <div className="mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Last Request</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => {
              const lastSub = [...teamRequests]
                .filter(s => s.userId === member.id)
                .sort((a, b) => b.date.localeCompare(a.date))[0];
              return (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <span className="font-mono">{minToHM(getMemberBalance(member.id))}</span>
                  </TableCell>
                  <TableCell className="text-xs">{lastSub ? `${lastSub.date} (${lastSub.status})` : "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Recent requests list */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Recent Team Requests</span>
        </div>
        <ul className="text-sm">
          {recentRequests.map((req) => (
            <li key={req.id} className="flex gap-2 items-baseline mb-1">
              <span className="inline-block w-28 font-medium">{getUserName(req.userId)}</span>
              <span className="mr-2">{req.type === "earn" ? "Earned" : "Used"}</span>
              <span className="font-mono">{minToHM(req.amount)}</span>
              <span className="text-xs text-gray-500">{req.date}</span>
              <span className={`ml-2 text-xs ${req.status === "Pending" ? "text-yellow-600" : req.status === "Rejected" ? "text-red-600" : "text-green-600"}`}>
                {req.status}
              </span>
              <span className="text-xs text-gray-400">{req.project ? `· ${req.project}` : ""}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-5 text-xs mt-2">
        <div className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded">
          <Bell className="inline-block w-3 h-3 mr-1" /> {pendingCount} Pending
        </div>
        <div className="bg-green-100 text-green-900 px-3 py-1 rounded">
          <Clock className="inline-block w-3 h-3 mr-1" /> {approvedCount} Approved
        </div>
        <div className="bg-red-100 text-red-900 px-3 py-1 rounded">
          <FileText className="inline-block w-3 h-3 mr-1" /> {rejectedCount} Rejected
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">Tip: Approve or reject requests in the Approvals tab.</div>
    </div>
  );
}
