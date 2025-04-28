
export function NoTeamMembers() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">No Team Members Assigned</h3>
      <p className="text-yellow-700 text-sm">
        You're set up as a manager, but you don't have any team members assigned to you yet.
        Ask your admin to assign team members to your account.
      </p>
    </div>
  );
}
