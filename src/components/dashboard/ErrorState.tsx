
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Error loading data</AlertTitle>
      <AlertDescription>
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="mt-2"
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
