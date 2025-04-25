
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast, toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { calculateToilBalance, minToHM, demoToilSubmissions } from "@/mockData";

const options = [
  { label: "Full Day (8:00h)", value: 480 },
  { label: "Half Day (4:00h)", value: 240 },
  { label: "Custom...", value: -1 },
];

const RequestTOIL = () => {
  const [date, setDate] = React.useState<Date | undefined>();
  const [amount, setAmount] = React.useState<number | null>(null);
  const [customHR, setCustomHR] = React.useState("");
  const [customMIN, setCustomMIN] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [showCustom, setShowCustom] = React.useState(false);
  const bal = calculateToilBalance(demoToilSubmissions);

  const selectedMinutes =
    amount === -1
      ? Number(customHR) * 60 + Number(customMIN)
      : amount ?? 0;
  const willGoNegative = selectedMinutes > bal;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (willGoNegative) {
      toast({
        title: "Insufficient TOIL balance",
        description: (<div>You cannot request more than you have ({minToHM(bal)}).</div>),
      });
      return;
    }
    toast({
      title: "TOIL request created (demo)",
      description: (
        <>
          <div>Date: {date ? format(date, "PPP") : ""}</div>
          <div>Amount: {minToHM(selectedMinutes)}</div>
          <div className="text-gray-700">{notes}</div>
        </>
      )
    });
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Request TOIL (Time Off In Lieu)</h2>
      <form className="space-y-4 bg-white p-4 rounded shadow" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="block mb-1 font-medium">Amount Requested</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={amount !== null ? amount : ""}
            onChange={e => {
              const val = Number(e.target.value);
              setAmount(val);
              setShowCustom(val === -1);
            }}
            required
          >
            <option value="" disabled>Choose an amount</option>
            {options.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
          </select>
          {showCustom && (
            <div className="flex gap-2 mt-1">
              <input type="number" min={0} max={24} className="border px-2 py-1 w-16 rounded" placeholder="HH"
                value={customHR} onChange={e => setCustomHR(e.target.value.replace(/\D/, ""))} />
              <span>:</span>
              <input type="number" min={0} max={59} className="border px-2 py-1 w-16 rounded" placeholder="MM"
                value={customMIN} onChange={e => setCustomMIN(e.target.value.replace(/\D/, ""))} />
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Notes (Optional)</label>
          <textarea className="border px-3 py-2 rounded w-full" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="text-sm text-gray-700">
          <b>Current Balance:</b> {minToHM(bal)}
          {selectedMinutes !== 0 && (
            <span className={willGoNegative ? "text-red-600 font-bold" : "text-green-700"}>
              &nbsp;→ {minToHM(bal - selectedMinutes)}
            </span>
          )}
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-lg font-semibold">Submit Request</Button>
      </form>
    </div>
  );
};

export default RequestTOIL;
