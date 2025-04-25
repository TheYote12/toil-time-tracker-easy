
import { demoToilSubmissions, minToHM } from "@/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Approvals = () => {
  // Only listing "Pending" - in the real app, filter for manager's team
  const pending = demoToilSubmissions.filter(s => s.status === "Pending");
  const [selected, setSelected] = useState<string | null>(null);
  const [managerNote, setManagerNote] = useState("");
  const [action, setAction] = useState<"Approve" | "Reject" | null>(null);

  const open = !!selected;
  const current = demoToilSubmissions.find(s => s.id === selected);

  function handleAct(act: "Approve" | "Reject") {
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
      <div className="bg-white p-4 rounded shadow">
        {pending.length === 0 ? (
          <div className="text-gray-600">No pending submissions right now!</div>
        ) : (
          <ul>
            {pending.map(s => (
              <li key={s.id} className="border-b last:border-0 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{s.type === "earn" ? "Extra Hours" : "TOIL Request"}</div>
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
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelected(s.id)}>Review</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
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
                <label className="block mb-1 text-sm font-medium">Manager Note (optional)</label>
                <textarea className="border px-3 py-2 rounded w-full" rows={2} value={managerNote} onChange={e => setManagerNote(e.target.value)} />
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
