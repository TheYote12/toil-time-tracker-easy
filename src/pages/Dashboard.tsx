
import { useFakeAuth, demoToilSubmissions, calculateToilBalance, minToHM, demoUsers } from "@/mockData";
import { Link } from "react-router-dom";
import ManagerDashboardPanel from "@/components/ManagerDashboardPanel";
import { ChartLine, ChartBar, ChartPie } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const pieColors = ["#a5b4fc", "#f472b6", "#34d399", "#facc15", "#f87171", "#818cf8", "#c084fc"];

const Dashboard = () => {
  const { user, role } = useFakeAuth();

  // Use filtered subs for managers vs employees
  const mySubs = role === "manager"
    ? demoToilSubmissions.filter(s => user.team && user.team.includes(s.userId))
    : demoToilSubmissions.filter(s => s.userId === user.id);

  const balance = calculateToilBalance(mySubs);

  // Visualization for all users: show active TOIL trend (past 6 requests)
  const lastSubs = mySubs.slice(-6);
  const chartLineData = lastSubs.map((s, idx) => ({
    name: s.date,
    TOIL: s.amount,
  }));

  // Extra visualizations for managers
  const isManager = role === "manager";
  const teamIds = isManager && user.team ? user.team : [];
  const teamMembers = demoUsers.filter(u => u.role === "employee" && teamIds.includes(u.id));
  const teamSubs = demoToilSubmissions.filter(s => teamIds.includes(s.userId));

  // Requests by status for pie
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of teamSubs) {
      counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [teamSubs]);

  // Bar: Earn vs Used per team member
  const barData = useMemo(() => {
    return teamMembers.map(member => {
      const memberSubs = teamSubs.filter(s => s.userId === member.id && s.status === "Approved");
      const earned = memberSubs.filter(s => s.type === "earn").reduce((sum, s) => sum + s.amount, 0);
      const used = memberSubs.filter(s => s.type === "use").reduce((sum, s) => sum + s.amount, 0);
      return {
        name: member.name,
        Earned: earned,
        Used: used,
      };
    });
  }, [teamMembers, teamSubs]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-lg px-5 py-4 flex-1 flex items-center justify-between">
            <span className="font-semibold text-lg">Current TOIL Balance</span>
            <span className="text-3xl font-mono font-bold">{minToHM(balance)}</span>
          </div>
        </div>

        {/* TOIL trend chart for all users */}
        <div className="mb-4 bg-white p-3 rounded border">
          <div className="flex items-center gap-2 mb-1">
            <ChartLine className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">TOIL Earned (most recent)</span>
          </div>
          <div>
            {chartLineData.length >= 2 ? (
              <svg width={240} height={50}>
                {/* Simple trend line */}
                <polyline
                  fill="none"
                  stroke="#9b87f5"
                  strokeWidth="2"
                  points={chartLineData.map((d, i) => `${20 + i * 40},${45 - d.TOIL}`).join(" ")}
                />
                {chartLineData.map((d, i) => (
                  <circle key={i} cx={20 + i * 40} cy={45 - d.TOIL} r="3" fill="#9b87f5" />
                ))}
              </svg>
            ) : (
              <span className="text-xs text-gray-500">Not enough data yet. Log extra hours to track your trend!</span>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-2">
          <Link to="/log-extra-hours" className="bg-violet-600 hover:bg-violet-700 text-white rounded px-4 py-2 font-medium shadow">Log Extra Hours</Link>
          <Link to="/request-toil" className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 font-medium shadow">Request TOIL</Link>
          <Link to="/toil-history" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded px-4 py-2 font-medium">View History</Link>
        </div>
      </div>
      {isManager && (
        <div className="mb-8 space-y-4">
          {/* Team Status Pie */}
          <div className="bg-white rounded border p-4">
            <div className="flex items-center mb-1 gap-2">
              <ChartPie className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Requests by Status</span>
            </div>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="95%" height={200}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {statusPieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500">No team requests yet.</span>
            )}
          </div>
          {/* Team Earned/Used Bar */}
          <div className="bg-white rounded border p-4">
            <div className="flex items-center mb-1 gap-2">
              <ChartBar className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">TOIL Earned / Used by Team Member</span>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="99%" height={260}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Earned" stackId="a" fill="#a78bfa" />
                  <Bar dataKey="Used" stackId="a" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500">No activity for direct reports.</span>
            )}
          </div>
        </div>
      )}
      {role === "manager" && <ManagerDashboardPanel />}
    </div>
  );
};

export default Dashboard;
