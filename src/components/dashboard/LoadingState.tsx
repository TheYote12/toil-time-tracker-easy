
export function LoadingState() {
  return (
    <div className="p-6 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    </div>
  );
}
