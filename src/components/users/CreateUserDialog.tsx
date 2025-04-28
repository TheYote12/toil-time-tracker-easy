
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  newUser: {
    email: string;
    password: string;
    name: string;
    role: string;
    department_id: string;
    manager_id: string;
  };
  setNewUser: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
    name: string;
    role: string;
    department_id: string;
    manager_id: string;
  }>>;
  departments: Department[];
}

export function CreateUserDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  newUser, 
  setNewUser, 
  departments 
}: CreateUserDialogProps) {
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate form fields
    const errors: {
      email?: string;
      password?: string;
      name?: string;
    } = {};
    
    // Email validation
    if (!newUser.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!newUser.password) {
      errors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    // Name validation
    if (!newUser.name) {
      errors.name = "Name is required";
    }
    
    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Form is valid, proceed with submission
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account. The user will receive their login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={validationErrors.name ? "text-destructive" : ""}>
              Name
            </Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className={validationErrors.name ? "border-destructive" : ""}
            />
            {validationErrors.name && (
              <div className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.name}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className={validationErrors.email ? "text-destructive" : ""}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className={validationErrors.email ? "border-destructive" : ""}
            />
            {validationErrors.email && (
              <div className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={validationErrors.password ? "text-destructive" : ""}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className={validationErrors.password ? "border-destructive" : ""}
            />
            {validationErrors.password && (
              <div className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                {validationErrors.password}
              </div>
            )}
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
                <SelectItem value="">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
