
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "manager" | "employee";

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: { name?: string; role?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isManager: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  refreshUserRole: () => Promise<void>;
};
