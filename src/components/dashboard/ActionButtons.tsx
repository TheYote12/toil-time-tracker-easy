
import { Link } from "react-router-dom";

export function ActionButtons() {
  return (
    <div className="flex gap-3 mb-2">
      <Link to="/log-extra-hours" className="bg-violet-600 hover:bg-violet-700 text-white rounded px-4 py-2 font-medium shadow">
        Log Extra Hours
      </Link>
      <Link to="/request-toil" className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 font-medium shadow">
        Request TOIL
      </Link>
      <Link to="/toil-history" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded px-4 py-2 font-medium">
        View History
      </Link>
    </div>
  );
}
