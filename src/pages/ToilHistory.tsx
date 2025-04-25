
import { demoToilSubmissions, minToHM } from "@/mockData";
import * as React from "react";

const options = [
  { label: "All", filter: () => true },
  { label: "Earned only", filter: (s: any) => s.type === "earn" },
  { label: "Taken only", filter: (s: any) => s.type === "use" },
];

const ToilHistory = () => {
  const [filt, setFilt] = React.useState(options[0]);
  // Should filter for user in real app
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">TOIL History</h2>
      <div className="flex gap-2 mb-3">
        <select className="border px-3 py-1 rounded" value={filt.label} onChange={e => setFilt(options.find(opt => opt.label === e.target.value)!)}>
          {options.map(o => <option key={o.label}>{o.label}</option>)}
        </select>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase font-semibold text-gray-500">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Project/Notes</th>
            </tr>
          </thead>
          <tbody>
            {demoToilSubmissions.filter(filt.filter).map(s => (
              <tr key={s.id} className="border-b text-sm">
                <td className="px-3 py-2">{s.date}</td>
                <td className="px-3 py-2">{s.type === "earn" ? "Earned" : "Taken"}</td>
                <td className="px-3 py-2 font-mono">{s.type === "earn" ? "+" : "-"}{minToHM(s.amount)}</td>
                <td className="px-3 py-2">
                  <span className={`py-1 px-2 rounded-full text-xs ${s.status === "Approved" ? "bg-green-100 text-green-800" : s.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-2 truncate max-w-xs">{s.project || ""} {s.notes ? ` · ${s.notes}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {demoToilSubmissions.filter(filt.filter).length === 0 && (
          <div className="text-center py-6 text-gray-500">No records found.</div>
        )}
      </div>
    </div>
  );
};

export default ToilHistory;
