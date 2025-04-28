
import { Button } from "@/components/ui/button";
import { UserTable } from "./users/UserTable";
import { CreateUserDialog } from "./users/CreateUserDialog";
import { EditUserDialog } from "./users/EditUserDialog";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export function UserManagement() {
  const {
    users,
    departments,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    editingUser,
    setEditingUser,
    newUser,
    setNewUser,
    handleCreateUser,
    handleEditClick,
    handleUpdateUser,
    isLoading,
    error,
    refreshData,
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData} 
            disabled={isLoading}
            title="Refresh user data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>Create User</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-gray-500">Loading users...</p>
        </div>
      ) : (
        <UserTable 
          users={users} 
          departments={departments} 
          onEditUser={handleEditClick} 
        />
      )}

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateUser}
        newUser={newUser}
        setNewUser={setNewUser}
        departments={departments}
      />
      
      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateUser}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        departments={departments}
      />
    </div>
  );
}
