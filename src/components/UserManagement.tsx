
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  role: string;
  department_id: string | null;
  manager_id: string | null;
  created_at?: string;
  // Email is not in the profiles table, we get it from auth.users
  // but we need it for creating new users
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
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        throw error;
      }
      
      if (profiles) {
        // Check if Alex exists and is admin, if not update him
        const alexUser = profiles.find(profile => 
          profile.name === "Alex Eason" || 
          profile.name.toLowerCase().includes("alex")
        );
        
        if (alexUser && alexUser.role !== "admin") {
          // Update Alex to admin
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
        
        // Convert profiles to User[] type
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
      // Update the user profile
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userItem) => (
            <TableRow key={userItem.id}>
              <TableCell>{userItem.name}</TableCell>
              <TableCell className="capitalize">{userItem.role}</TableCell>
              <TableCell>
                {departments.find(d => d.id === userItem.department_id)?.name || 'None'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditClick(userItem)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive their login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newUser.department_id}
                onValueChange={(value) => setNewUser({ ...newUser, department_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={editingUser.department_id || ""}
                  onValueChange={(value) => setEditingUser({ ...editingUser, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
