"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Role = "student" | "teacher" | null;

interface AuthContextType {
  role: Role;
  userId: Id<"users"> | null;
  userName: string;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userId: null,
  userName: "",
  setRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const seedDb = useMutation(api.seed.seedDatabase);

  const user = useQuery(
    api.users.getByRole,
    role ? { role } : "skip"
  );

  // Ensure DB is initialized with multi-subject data
  useEffect(() => {
    seedDb({}).catch((err: unknown) => {
      console.warn("Auto-seed check:", err);
    });
  }, [seedDb]);

  // Persist role in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("learnai_role") as Role;
    if (saved) setRole(saved);
  }, []);

  useEffect(() => {
    if (role) {
      localStorage.setItem("learnai_role", role);
    } else {
      localStorage.removeItem("learnai_role");
    }
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        role,
        userId: user?._id || null,
        userName: user?.name || "",
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
