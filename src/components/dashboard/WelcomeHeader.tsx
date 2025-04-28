
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@/components/dashboard/ReloadIcon";

interface WelcomeHeaderProps {
  userName?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function WelcomeHeader({ userName, isRefreshing, onRefresh }: WelcomeHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-2xl font-bold">Welcome{userName ? `, ${userName}` : ''}</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={isRefreshing}
        className="flex items-center gap-1"
      >
        {isRefreshing ? (
          <>
            <ReloadIcon className="w-4 h-4 animate-spin" /> Refreshing...
          </>
        ) : (
          <>
            <ReloadIcon className="w-4 h-4" /> Refresh Data
          </>
        )}
      </Button>
    </div>
  );
}
