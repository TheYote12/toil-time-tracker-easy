
// Enhanced TOIL History page with fix for userId on submissions,
// and managers see team history

import { demoToilSubmissions, minToHM, useFakeAuth, demoUsers } from "@/mockData";
import { useState } from "react";
import { Search } from "lucide-react";

const ToilHistory = () => {
  const { user, role } = useFakeAuth();
  const [query, setQuery] = useState("");
  // If manager, show their whole team's history. Otherwise, just own.
  const userIds = role === "manager" && user.team ? user.team : [user.id];
  const filtered = demoToilSubmissions
    .filter(
      s =>
        userIds.includes(s.userId) &&
        ((s.project?.toLowerCase().includes(query.toLowerCase()) || s.date.includes(query)))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const getUserName = (id: string) => demoUsers.find(u => u.id === id)?.name || "";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-3">TOIL History</h2>
      <div className="flex items-center mb-2 gap-2">
        <Search className="w-5 h-5" aria-hidden="true" />
        <input
          type="search"
          className="border px-2 py-1 rounded w-64"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by project or date"
          aria-label="Search history"
        />
      </div>
      <div className="bg-white p-4 rounded shadow">
        {filtered.length === 0 ? (
          <div className="text-gray-600">No submissions found.</div>
        ) : (
          <ul>
            {filtered.map(s => (
              <li key={s.id} className="border-b last:border-0 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">
                    {s.type === "earn" ? "Extra Hours" : "TOIL Request"}
                    {role === "manager" && (
                      <span className="text-xs text-gray-400 ml-2">({getUserName(s.userId)})</span>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm">{s.date} {s.project && `· ${s.project}`}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {s.type === "earn" && s.startTime && s.endTime ? (
                      <>
                        {s.startTime} to {s.endTime} &rarr; <b className="font-mono">{minToHM(s.amount)}</b> possible TOIL
                      </>
                    ) : (
                      <>Request: <b className="font-mono">{minToHM(s.amount)}</b></>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{s.notes}</div>
                </div>
                <div className="text-sm text-gray-500">{s.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default ToilHistory;

