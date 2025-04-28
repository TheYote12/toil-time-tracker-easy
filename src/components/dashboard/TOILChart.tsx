
import { ChartLine } from "lucide-react";

interface TOILSubmission {
  date: string;
  amount: number;
}

interface TOILChartProps {
  chartLineData: Array<{ name: string; TOIL: number }>;
}

export function TOILChart({ chartLineData }: TOILChartProps) {
  return (
    <div className="mb-4 bg-white p-3 rounded border">
      <div className="flex items-center gap-2 mb-1">
        <ChartLine className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">TOIL Earned (most recent)</span>
      </div>
      <div>
        {chartLineData.length >= 2 ? (
          <svg width={240} height={50}>
            <polyline
              fill="none"
              stroke="#9b87f5"
              strokeWidth="2"
              points={chartLineData.map((d, i) => `${20 + i * 40},${45 - d.TOIL * 0.05}`).join(" ")}
            />
            {chartLineData.map((d, i) => (
              <circle key={i} cx={20 + i * 40} cy={45 - d.TOIL * 0.05} r="3" fill="#9b87f5" />
            ))}
          </svg>
        ) : (
          <span className="text-xs text-gray-500">Not enough data yet. Log extra hours to track your trend!</span>
        )}
      </div>
    </div>
  );
}
