
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/hooks/useUsers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingDepartment: {
    id: string;
    name: string;
    members?: User[];
  } | null;
  setEditingDepartment: React.Dispatch<React.SetStateAction<{
    id: string;
    name: string;
    members?: User[];
  } | null>>;
  users: User[];
  handleAssignUserToDepartment: (userId: string, departmentId: string | null) => Promise<void>;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  onSubmit,
  editingDepartment,
  setEditingDepartment,
  users,
  handleAssignUserToDepartment
}: EditDepartmentDialogProps) {
  if (!editingDepartment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department information and manage department members.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Department Details</TabsTrigger>
            <TabsTrigger value="members">Department Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="py-4">
            <form onSubmit={onSubmit} id="edit-department-form">
              <div className="grid grid-cols-4 items-center gap-4 mb-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingDepartment.name}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" form="edit-department-form" disabled={!editingDepartment.name.trim()}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="members" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Current Members</h3>
                {editingDepartment.members && editingDepartment.members.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editingDepartment.members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAssignUserToDepartment(member.id, null)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No members in this department.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Add Member</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Select onValueChange={(value) => handleAssignUserToDepartment(value, editingDepartment.id)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter(user => user.department_id !== editingDepartment.id)
                          .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
