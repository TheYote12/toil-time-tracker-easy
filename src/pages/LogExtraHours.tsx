
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast, toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const defaultContractedMins = 8 * 60;

function roundDown15(dt: Date) {
  const copy = new Date(dt);
  copy.setMinutes(Math.floor(copy.getMinutes() / 15) * 15, 0, 0);
  return copy;
}
function roundUp15(dt: Date) {
  const copy = new Date(dt);
  copy.setMinutes(Math.ceil(copy.getMinutes() / 15) * 15, 0, 0);
  return copy;
}
function diffMins(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}
export function minToHM(minutes: number) {
  if (minutes < 0) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

const projectList = ["Client X Rollout", "Internal Update", "Support"];

const LogExtraHours = () => {
  const { toast } = useToast();
  const [date, setDate] = React.useState<Date | undefined>();
  const [project, setProject] = React.useState("");
  const [startTime, setStartTime] = React.useState(""); // "09:00"
  const [endTime, setEndTime] = React.useState("");
  const [weekend, setWeekend] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  // Calculate things
  let canPreview = date && startTime && endTime;
  let roundedStart = date && startTime ? roundDown15(new Date(date.toDateString() + " " + startTime)) : undefined;
  let roundedEnd = date && endTime ? roundUp15(new Date(date.toDateString() + " " + endTime)) : undefined;
  let duration = (roundedStart && roundedEnd && roundedEnd > roundedStart) ? diffMins(roundedStart, roundedEnd) : 0;
  let earned = weekend ? duration : Math.max(0, duration - defaultContractedMins);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast({
      title: "Submission created (demo)",
      description: (
        <>
          <div>Date: {date ? format(date, "PPP") : ""}</div>
          <div>Project: {project}</div>
          <div>
            Time: {startTime} - {endTime} → {roundedStart ? format(roundedStart, "HH:mm") : ""} ~ {roundedEnd ? format(roundedEnd, "HH:mm") : ""} ({minToHM(duration)})
          </div>
          <div className="text-green-700 font-semibold">Hours Earned: {minToHM(earned)}</div>
        </>
      )
    });
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Log Extra Hours Worked</h2>
      <form className="space-y-4 bg-white p-4 rounded shadow" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Date of Work</label>
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
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            list="projectList"
            type="text"
            value={project}
            onChange={e => setProject(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter or pick a project"
            required
          />
          <datalist id="projectList">
            {projectList.map(p => <option value={p} key={p} />)}
          </datalist>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="weekend" checked={weekend} onChange={e => setWeekend(e.target.checked)} />
          <label htmlFor="weekend" className="font-medium">Weekend Work?</label>
        </div>
        <div>
          <label className="block mb-1 font-medium">Notes (Optional)</label>
          <textarea className="border px-3 py-2 rounded w-full" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        {canPreview && (
          <div className="bg-purple-50 border rounded p-3 text-sm">
            <div>
              Start: <span className="font-mono">{startTime}</span> → rounded <span className="font-mono">{roundedStart ? format(roundedStart, "HH:mm") : ""}</span>
            </div>
            <div>
              End: <span className="font-mono">{endTime}</span> → rounded <span className="font-mono">{roundedEnd ? format(roundedEnd, "HH:mm") : ""}</span>
            </div>
            <div>
              Duration: <span className="font-mono">{minToHM(duration)}</span>
            </div>
            <div>
              Hours earned: <span className="font-mono text-green-900 font-bold">{minToHM(earned)}</span>
              <span className="ml-2 text-gray-500">
                ({weekend ? "Weekend, no deduction" : "Minus 8h contracted"})
              </span>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded text-lg font-semibold">Submit for Approval</Button>
      </form>
    </div>
  );
};

export default LogExtraHours;
