import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUsers, User } from "./useUsers";
import { useDepartments } from "./useDepartments";
import { useAuth } from "@/contexts/auth";

interface NewUser {
  email: string;
  password: string;
  name: string;
  role: string;
  department_id: string;
  manager_id: string;
}

export function useUserManagement() {
  const { user } = useAuth();
  const { users, fetchUsers, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { departments, isLoading: isLoadingDepartments, error: departmentsError } = useDepartments();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    password: "",
    name: "",
    role: "employee",
    department_id: "",
    manager_id: user?.id || "",
  });

  // Combine loading states
  const isLoading = isLoadingUsers || isLoadingDepartments;
  
  // Combine error states
  const error = usersError || departmentsError;

  const refreshData = async () => {
    await fetchUsers();
  };

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      console.log("Creating new user:", newUser);
      const { data, error } = await supabase.rpc('create_user_with_profile', {
        email: newUser.email,
        password: newUser.password,
        user_role: newUser.role,
        user_name: newUser.name,
        department_id: newUser.department_id || null,
        manager_id: newUser.manager_id || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      setShowCreateDialog(false);
      fetchUsers();
      
      // Reset form
      setNewUser({
        email: "",
        password: "",
        name: "",
        role: "employee",
        department_id: "",
        manager_id: user?.id || "",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    }
  }
  
  function handleEditClick(selectedUser: User) {
    console.log("Editing user:", selectedUser);
    setEditingUser(selectedUser);
    setShowEditDialog(true);
  }
  
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      console.log("Updating user:", editingUser);
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editingUser.name,
          role: editingUser.role,
          department_id: editingUser.department_id,
          manager_id: editingUser.manager_id
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      setShowEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return {
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
  };
}
