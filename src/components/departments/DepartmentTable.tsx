
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Department } from "@/hooks/useDepartments";
import { User } from "@/hooks/useUsers";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DepartmentTableProps {
  departments: Department[];
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  getDepartmentMembers: (departmentId: string) => User[];
}

export function DepartmentTable({ 
  departments,
  onEditDepartment,
  onDeleteDepartment,
  getDepartmentMembers
}: DepartmentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No departments found.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((department) => {
              const members = getDepartmentMembers(department.id);
              
              return (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">{members.length} members</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditDepartment(department)}
                        title="Edit department"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteDepartment(department)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
