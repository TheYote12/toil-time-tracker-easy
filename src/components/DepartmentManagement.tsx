
import { Button } from "@/components/ui/button";
import { useDepartmentManagement } from "@/hooks/useDepartmentManagement";
import { DepartmentTable } from "./departments/DepartmentTable";
import { CreateDepartmentDialog } from "./departments/CreateDepartmentDialog";
import { EditDepartmentDialog } from "./departments/EditDepartmentDialog";
import { DeleteDepartmentDialog } from "./departments/DeleteDepartmentDialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export function DepartmentManagement() {
  const {
    departments,
    users,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    editingDepartment,
    setEditingDepartment,
    newDepartment,
    setNewDepartment,
    handleCreateDepartment,
    handleEditClick,
    handleUpdateDepartment,
    handleDeleteClick,
    handleDeleteDepartment,
    handleAssignUserToDepartment,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    getDepartmentMembers
  } = useDepartmentManagement();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Department Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData} 
            disabled={isLoading || isRefreshing}
            title="Refresh department data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>Create Department</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading || isRefreshing}>
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-gray-500">Loading departments...</p>
        </div>
      ) : (
        <DepartmentTable 
          departments={departments}
          onEditDepartment={handleEditClick}
          onDeleteDepartment={handleDeleteClick}
          getDepartmentMembers={getDepartmentMembers}
        />
      )}

      <CreateDepartmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateDepartment}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
      />
      
      <EditDepartmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateDepartment}
        editingDepartment={editingDepartment}
        setEditingDepartment={setEditingDepartment}
        users={users}
        handleAssignUserToDepartment={handleAssignUserToDepartment}
      />
      
      <DeleteDepartmentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDeleteDepartment}
        department={editingDepartment}
      />
    </div>
  );
}
