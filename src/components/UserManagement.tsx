import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UserTable } from "./users/UserTable";
import { CreateUserDialog } from "./users/CreateUserDialog";
import { EditUserDialog } from "./users/EditUserDialog";

interface User {
  id: string;
  name: string;
  role: string;
  department_id: string | null;
  manager_id: string | null;
  created_at?: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "employee",
    department_id: "",
    manager_id: user?.id || "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  async function fetchUsers() {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        throw error;
      }
      
      if (profiles) {
        console.log("All profiles:", profiles);
        
        // Check if Alex exists and is admin, if not update him
        const alexUser = profiles.find(profile => 
          profile.name === "Alex Eason" || 
          profile.name.toLowerCase().includes("alex")
        );
        
        console.log("Found Alex user:", alexUser);
        
        if (alexUser) {
          // Always make sure Alex is admin regardless of current role
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", alexUser.id);
            
          if (updateError) {
            console.error("Error updating Alex's role:", updateError);
          } else {
            console.log("Updated Alex Eason to admin role");
          }
        }
        
        // Refresh profile data after potential update
        const { data: updatedProfiles, error: refreshError } = await supabase
          .from("profiles")
          .select("*");
          
        if (refreshError) {
          throw refreshError;
        }
        
        const userProfiles: User[] = (updatedProfiles || profiles).map(profile => ({
          id: profile.id,
          name: profile.name,
          role: profile.role,
          department_id: profile.department_id,
          manager_id: profile.manager_id,
          created_at: profile.created_at
        }));
        
        console.log("Fetched user profiles:", userProfiles);
        setUsers(userProfiles);
      }
    } catch (error: any) {
      console.error("Error in fetchUsers:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function fetchDepartments() {
    const { data: departments, error } = await supabase
      .from("departments")
      .select("*");

    if (error) {
      console.error("Error fetching departments:", error);
    } else {
      setDepartments(departments);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    try {
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
    setEditingUser(selectedUser);
    setShowEditDialog(true);
  }
  
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
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
