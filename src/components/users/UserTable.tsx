
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  role: string;
  department_id: string | null;
  manager_id: string | null;
  created_at?: string;
}

interface Department {
  id: string;
  name: string;
}

interface UserTableProps {
  users: User[];
  departments: Department[];
  onEditUser: (user: User) => void;
}

export function UserTable({ users, departments, onEditUser }: UserTableProps) {
  return (
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
                onClick={() => onEditUser(userItem)}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
