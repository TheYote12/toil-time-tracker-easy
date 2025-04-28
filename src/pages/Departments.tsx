
import { DepartmentManagement } from "@/components/DepartmentManagement";
import { useAuth } from "@/contexts/auth";
import { Alert } from "@/components/ui/alert";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    </div>
  );
}
