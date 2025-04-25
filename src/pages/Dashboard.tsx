
import { useFakeAuth, demoToilSubmissions, calculateToilBalance, minToHM } from "@/mockData";
import { Link } from "react-router-dom";
import ManagerDashboardPanel from "@/components/ManagerDashboardPanel";
import { ChartLine } from "lucide-react";

const Dashboard = () => {
  const { user, role } = useFakeAuth();
  const mySubs = demoToilSubmissions.filter(s => true); // Use all for demo.
  const balance = calculateToilBalance(mySubs);

  // Visualization for all users: show active TOIL trend (past 6 requests)
  const lastSubs = mySubs.slice(-6);
  const chartLineData = lastSubs.map((s, idx) => ({
    name: s.date,
    TOIL: s.amount,
  }));

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
      {role === "manager" && <ManagerDashboardPanel />}
    </div>
  );
};

export default Dashboard;
