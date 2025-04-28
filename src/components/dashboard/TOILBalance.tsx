
import { minToHM } from "@/pages/RequestTOIL";
import { Card, CardContent } from "@/components/ui/card";

interface TOILBalanceProps {
  balance: number;
}

export function TOILBalance({ balance }: TOILBalanceProps) {
  return (
    <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-lg px-5 py-4 flex-1 flex items-center justify-between">
      <span className="font-semibold text-lg">Current TOIL Balance</span>
      <div className="flex flex-col items-end">
        <span className="text-3xl font-mono font-bold">{minToHM(balance)}</span>
        {balance > 35 * 60 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Approaching limit</span>
        )}
      </div>
    </div>
  );
}
