import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDepartments, Department } from "./useDepartments";
import { useUsers, User } from "./useUsers";

interface EditingDepartment extends Department {
  members?: User[];
}

export function useDepartmentManagement() {
  const { departments, fetchDepartments, isLoading: isLoadingDepartments, error: departmentsError } = useDepartments();
  const { users, fetchUsers, isLoading: isLoadingUsers } = useUsers();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<EditingDepartment | null>(null);
  const [newDepartment, setNewDepartment] = useState<{name: string}>({ name: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine loading states
  const isLoading = isLoadingDepartments || isLoadingUsers;
  
  // Use departmentsError for error state
  const error = departmentsError;

  const getDepartmentMembers = (departmentId: string) => {
    return users.filter(user => user.department_id === departmentId);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchDepartments();
    await fetchUsers();
    setIsRefreshing(false);
  };

  async function handleCreateDepartment(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("departments")
        .insert({ name: newDepartment.name });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department created successfully",
      });
      
      setShowCreateDialog(false);
      refreshData();
      
      // Reset form
      setNewDepartment({ name: "" });
    } catch (error: any) {
      console.error("Error creating department:", error);
      toast({
        title: "Error creating department",
        description: error.message,
        variant: "destructive",
      });
    }
  }
  
  function handleEditClick(department: Department) {
    const departmentWithMembers = {
      ...department,
      members: getDepartmentMembers(department.id)
    };
    
    setEditingDepartment(departmentWithMembers);
    setShowEditDialog(true);
  }
  
  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDepartment) return;
    
    try {
      const { error } = await supabase
        .from("departments")
        .update({ name: editingDepartment.name })
        .eq("id", editingDepartment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department updated successfully",
      });
      
      setShowEditDialog(false);
      setEditingDepartment(null);
      refreshData();
    } catch (error: any) {
      console.error("Error updating department:", error);
      toast({
        title: "Error updating department",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function handleDeleteClick(department: Department) {
    setEditingDepartment(department);
    setShowDeleteDialog(true);
  }
  
  async function handleDeleteDepartment() {
    if (!editingDepartment) return;
    
    try {
      // First, remove department from profiles using our custom function
      const { error: rpcError, data } = await supabase.rpc(
        'remove_department_from_profiles',
        { department_id_param: editingDepartment.id }
      );
      
      if (rpcError) throw rpcError;
      
      // Then delete the department
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", editingDepartment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      
      setShowDeleteDialog(false);
      setEditingDepartment(null);
      refreshData();
    } catch (error: any) {
      console.error("Error deleting department:", error);
      toast({
        title: "Error deleting department",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleAssignUserToDepartment(userId: string, departmentId: string | null) {
    try {
      if (!departmentId) {
        // If departmentId is null, just set it to null in the profiles table
        const { error } = await supabase
          .from("profiles")
          .update({ department_id: null })
          .eq("id", userId);

        if (error) throw error;
      } else {
        // Use the safe function to update user department
        const { error: rpcError, data } = await supabase.rpc(
          'update_user_department',
          { 
            user_id_param: userId, 
            department_id_param: departmentId 
          }
        );

        if (rpcError) throw rpcError;
      }

      toast({
        title: "Success",
        description: "User department updated successfully",
      });
      
      // If we're in edit mode, refresh the editing department's members
      if (editingDepartment && departmentId === editingDepartment.id) {
        await fetchUsers();
        setEditingDepartment({
          ...editingDepartment,
          members: getDepartmentMembers(editingDepartment.id)
        });
      }
      
      refreshData();
    } catch (error: any) {
      console.error("Error updating user department:", error);
      toast({
        title: "Error updating user department",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return {
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
  };
}
