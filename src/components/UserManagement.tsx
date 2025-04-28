
import { Button } from "@/components/ui/button";
import { UserTable } from "./users/UserTable";
import { CreateUserDialog } from "./users/CreateUserDialog";
import { EditUserDialog } from "./users/EditUserDialog";
import { useUserManagement } from "@/hooks/useUserManagement";

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
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>Create User</Button>
      </div>

      <UserTable 
        users={users} 
        departments={departments} 
        onEditUser={handleEditClick} 
      />

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
