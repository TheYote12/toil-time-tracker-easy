
import { useFakeAuth } from "@/contexts/FakeAuthContext";
import { demoToilSubmissions, calculateToilBalance, minToHM } from "@/mockData";
import { User as UserIcon } from "lucide-react";

export default function SidebarProfile() {
  const { user, role } = useFakeAuth();
  // Show balance just for current user
  const balance = calculateToilBalance(demoToilSubmissions.filter(s => s.userId === user.id));
  return (
    <div className="flex items-center gap-3 px-2 py-3 rounded bg-gray-100 mb-1 min-h-[56px]">
      <UserIcon className="w-8 h-8 text-purple-500" aria-hidden="true" />
      <div>
        <div className="font-semibold text-gray-800">{user.name}</div>
        <div className="text-xs text-gray-500 capitalize">{role}</div>
        <div className="text-xs text-purple-600 font-mono">TOIL: {minToHM(balance)}</div>
      </div>
    </div>
  );
}
