
import { DepartmentManagement } from "@/components/DepartmentManagement";
import { useAuth } from "@/contexts/auth";
import { Alert } from "@/components/ui/alert";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Departments() {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  // Redirect non-managers away from this page
  useEffect(() => {
    if (!isManager) {
      navigate("/dashboard");
    }
  }, [isManager, navigate]);

  if (!isManager) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <DepartmentManagement />
      
      {/* This hidden div contains guidance for any database-level errors */}
      <div className="hidden">
        <Alert variant="destructive">
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            <p>If you're seeing an infinite recursion error in the profiles table's RLS policy, please contact your administrator to update the database functions.</p>
            <Button variant="outline" size="sm" className="mt-2 flex items-center gap-1">
              <ExternalLink className="h-4 w-4" /> View Documentation
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
