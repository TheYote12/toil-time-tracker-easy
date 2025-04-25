
import { demoToilSubmissions, minToHM } from "@/mockData";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { Users, TrendingUp, Bell } from "lucide-react";

export default function ManagerDashboardPanel() {
  // Show stats for manager in the dashboard
  const pendingCount = demoToilSubmissions.filter(s => s.status === "Pending").length;
  const approvedCount = demoToilSubmissions.filter(s => s.status === "Approved").length;
  const rejectedCount = demoToilSubmissions.filter(s => s.status === "Rejected").length;

  // Aggregate by status for visualization
  const chartData = [
    { name: "Pending", value: pendingCount },
    { name: "Approved", value: approvedCount },
    { name: "Rejected", value: rejectedCount },
  ];

  const config = {
    Pending: { label: "Pending", color: "#fbbf24", icon: Bell },
    Approved: { label: "Approved", color: "#22c55e", icon: TrendingUp },
    Rejected: { label: "Rejected", color: "#ef4444", icon: Users },
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-700">Manager Insights</h3>
      </div>
      <div className="text-blue-900 mb-1 text-xs">
        Overview of the status of your team's TOIL activity. Review and approve pending requests below.
      </div>
      {/* Chart for managers */}
      <ChartContainer config={config} className="bg-white rounded p-2 mt-2">
        <svg width={280} height={100}>
          {/* Custom bar chart for simplicity */}
          {chartData.map((item, i) => (
            <g key={item.name} transform={`translate(${i * 90 + 12},30)`}>
              <rect
                width="40"
                height={item.value * 14}
                y={60 - item.value * 14}
                fill={config[item.name].color}
                rx="6"
              />
              <text x="20" y="75" textAnchor="middle" className="text-xs fill-gray-700">{item.name}</text>
              <text x="20" y={59 - item.value * 14} textAnchor="middle" className="text-xs fill-gray-800 font-bold">{item.value}</text>
            </g>
          ))}
        </svg>
        <ChartLegend payload={chartData.map(d => ({ value: d.name, color: config[d.name].color }))} />
      </ChartContainer>
      <div className="mt-3 text-sm">
        <b>{pendingCount}</b> requests pending <span aria-label="approval">🕒</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">Tip: Approve or reject requests in the Approvals tab to keep your team's TOIL balanced.</div>
    </div>
  );
}
