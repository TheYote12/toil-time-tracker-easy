
import { demoToilSubmissions, minToHM, demoUsers } from "@/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useFakeAuth } from "@/contexts/FakeAuthContext";

const Approvals = () => {
  const { user, role } = useFakeAuth();
  const [query, setQuery] = useState("");
  // Only managers should see their team's pending requests.
  let pending: typeof demoToilSubmissions = [];

  if (role === "manager" && user.team && user.team.length > 0) {
    pending = demoToilSubmissions.filter(
      s =>
        s.status === "Pending" &&
        user.team!.includes(s.userId) &&
        ((s.project?.toLowerCase().includes(query.toLowerCase()) || s.date.includes(query)))
    );
  } else if (role === "employee") {
    // Employees shouldn't see anything in Approvals.
    pending = [];
  } else {
    // Managers with no team or other roles see nothing
    pending = [];
  }

  const [selected, setSelected] = useState<string | null>(null);
  const [managerNote, setManagerNote] = useState("");
  const [action, setAction] = useState<"Approve" | "Reject" | null>(null);

  const open = !!selected;
  const current = demoToilSubmissions.find(s => s.id === selected);

  function handleAct(act: "Approve" | "Reject") {
    if (!window.confirm(`Are you sure you want to ${act.toLowerCase()} this request?`)) return;
    setAction(act);
  }
  function handleDialogClose() {
    setSelected(null);
    setManagerNote("");
    setAction(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-3">Pending Approvals</h2>
      {role !== "manager" ? (
        <div className="text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          Only managers can view and review pending TOIL requests for their team.
        </div>
      ) : (
        <>
          <div className="flex items-center mb-2 gap-2">
            <Search className="w-5 h-5" aria-hidden="true" />
            <input
              type="search"
              className="border px-2 py-1 rounded w-64"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by project or date"
              aria-label="Search approvals"
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            {pending.length === 0 ? (
              <div className="text-gray-600">No pending submissions right now!</div>
            ) : (
              <ul>
                {pending.map(s => (
                  <li key={s.id} className="border-b last:border-0 py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-semibold">{s.type === "earn" ? "Extra Hours" : "TOIL Request"}</div>
                      <div className="text-gray-700 text-sm">
                        {s.date} {s.project && `· ${s.project}`} <span className="text-xs text-gray-400 ml-1">({demoUsers.find(u => u.id === s.userId)?.name || "Unknown"})</span>
                      </div>
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
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelected(s.id)}>Review</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          {current && (
            <div>
              <div className="mb-2">
                <div>
                  <span className="font-bold">{current.type === "earn" ? "Extra Hours" : "TOIL Request"}</span>
                  {" "}on <span>{current.date}</span> {current.project && `· ${current.project}`}
                </div>
                <div className="text-gray-700 text-sm mt-1">
                  Amount: <span className="font-mono">{minToHM(current.amount)}</span>
                </div>
                {current.notes && <div className="text-xs text-gray-400 mt-1">Notes: {current.notes}</div>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium" htmlFor="manager-note">Manager Note (optional)</label>
                <textarea id="manager-note" className="border px-3 py-2 rounded w-full" rows={2} value={managerNote} onChange={e => setManagerNote(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="bg-gray-300" variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAct("Approve")}>Approve</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAct("Reject")}>Reject</Button>
          </DialogFooter>
          {action && (
            <div className="mt-2 text-center text-lg font-semibold text-green-800">
              {action === "Approve" ? "Approved! (Demo)" : "Rejected! (Demo)"}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;

