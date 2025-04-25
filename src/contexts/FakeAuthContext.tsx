
import React, { createContext, useContext, useState, useEffect } from "react";
import { demoUsers, Role, User } from "@/mockData";

// Type for AuthContext
type FakeAuthContextType = {
  user: User;
  role: Role;
  setUser: (user: User) => void;
  setRole: (role: Role) => void;
};

const defaultUser = demoUsers[0];

const FakeAuthContext = createContext<FakeAuthContextType>({
  user: defaultUser,
  role: defaultUser.role,
  setUser: () => {},
  setRole: () => {},
});

export function FakeAuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(defaultUser.role);
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    if (user.role !== role) {
      const firstMatch = demoUsers.find((u) => u.role === role) || demoUsers[0];
      setUser(firstMatch);
    }
  }, [role]);

  return (
    <FakeAuthContext.Provider value={{ user, role, setUser, setRole }}>
      {children}
    </FakeAuthContext.Provider>
  );
}

export function useFakeAuth() {
  return useContext(FakeAuthContext);
}
