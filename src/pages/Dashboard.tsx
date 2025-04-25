
import { useFakeAuth, demoToilSubmissions, calculateToilBalance, minToHM } from "@/mockData";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, role } = useFakeAuth();
  const mySubs = demoToilSubmissions.filter(s => true); // filter for this user if wanted

  const balance = calculateToilBalance(mySubs);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-lg px-5 py-4 flex-1 flex items-center justify-between">
            <span className="font-semibold text-lg">Current TOIL Balance</span>
            <span className="text-3xl font-mono font-bold">{minToHM(balance)}</span>
          </div>
        </div>
        <div className="flex gap-3 mb-2">
          <Link to="/log-extra-hours" className="bg-violet-600 hover:bg-violet-700 text-white rounded px-4 py-2 font-medium shadow">Log Extra Hours</Link>
          <Link to="/request-toil" className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 font-medium shadow">Request TOIL</Link>
          <Link to="/toil-history" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded px-4 py-2 font-medium">View History</Link>
        </div>
      </div>
      {role === "manager" && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-2">
          <div className="font-bold text-blue-700 mb-1">Manager Panel</div>
          <p className="text-blue-800">You have{" "}
            <span className="font-semibold">{demoToilSubmissions.filter(s => s.status === "Pending").length}</span> pending approvals.
            <Link className="ml-2 underline text-blue-600" to="/approvals">Review now</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
