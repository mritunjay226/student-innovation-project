"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Role = "student" | "teacher" | null;

interface AuthContextType {
  role: Role;
  userId: Id<"users"> | null;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  isSignedIn: boolean;
  isClerkLoaded: boolean;
  setRole: (role: Role) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userId: null,
  userName: "",
  userEmail: "",
  userAvatar: undefined,
  isSignedIn: false,
  isClerkLoaded: false,
  setRole: () => {},
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
  toggleSidebar: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const seedDb = useMutation(api.seed.seedDatabase);
  const syncClerkUser = useMutation(api.users.syncClerkUser);

  // Clerk Authentication Hook
  let clerkUser: ReturnType<typeof useClerkUser>["user"] = null;
  let isClerkLoaded = false;
  let isSignedIn = false;
  let clerkSignOut: (() => Promise<void>) | null = null;

  try {
    const clerk = useClerkUser();
    const clerkInstance = useClerk();
    clerkUser = clerk.user;
    isClerkLoaded = clerk.isLoaded;
    isSignedIn = clerk.isSignedIn || false;
    clerkSignOut = clerkInstance.signOut;
  } catch {
    isClerkLoaded = true;
  }

  // Query database user by Clerk ID when signed in
  const syncedUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Fallback demo user by role if not signed in with Clerk
  const fallbackUser = useQuery(
    api.users.getByRole,
    !clerkUser && role ? { role } : "skip"
  );

  // Ensure DB is initialized with multi-subject data
  useEffect(() => {
    seedDb({}).catch((err: unknown) => {
      console.warn("Auto-seed check:", err);
    });
  }, [seedDb]);

  // Synchronize Clerk user to Convex database
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const fullName = clerkUser.fullName || clerkUser.firstName || "Scholar";
      const avatar = clerkUser.imageUrl;

      syncClerkUser({
        clerkId: clerkUser.id,
        name: fullName,
        email: email,
        avatar: avatar,
        role: role || "student",
        grade: "Class 12",
      }).catch((err) => {
        console.error("Failed to sync Clerk user with Convex:", err);
      });
    }
  }, [isSignedIn, clerkUser, role, syncClerkUser]);

  // Route Protection: If going to /student or /teacher while unauthenticated
  useEffect(() => {
    if (!isClerkLoaded) return;
    const isProtectedPath = pathname?.startsWith("/student") || pathname?.startsWith("/teacher");
    const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

    if (isProtectedPath && !isSignedIn && hasClerkKey) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
  }, [isClerkLoaded, isSignedIn, pathname, router]);

  // Persist role in localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("axiora_role") || localStorage.getItem("learnai_role")) as Role;
    if (saved) setRole(saved);
  }, []);

  useEffect(() => {
    if (role) {
      localStorage.setItem("axiora_role", role);
    } else {
      localStorage.removeItem("axiora_role");
      localStorage.removeItem("learnai_role");
    }
  }, [role]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const logout = useCallback(async () => {
    if (clerkSignOut) {
      try {
        await clerkSignOut();
      } catch (err) {
        console.error("Clerk sign out error:", err);
      }
    }
    setRole(null);
    localStorage.removeItem("axiora_role");
    router.push("/");
  }, [clerkSignOut, router]);

  // Determine active user profile
  const activeUserId = syncedUser?._id || fallbackUser?._id || null;
  const activeUserName = clerkUser?.fullName || syncedUser?.name || fallbackUser?.name || (role === "teacher" ? "Dr. Priya Sharma" : "Kristin Watson");
  const activeUserEmail = clerkUser?.primaryEmailAddress?.emailAddress || syncedUser?.email || "";
  const activeUserAvatar = clerkUser?.imageUrl || syncedUser?.avatar || fallbackUser?.avatar || "/avatar.jpg";

  return (
    <AuthContext.Provider
      value={{
        role,
        userId: activeUserId,
        userName: activeUserName,
        userEmail: activeUserEmail,
        userAvatar: activeUserAvatar,
        isSignedIn,
        isClerkLoaded,
        setRole,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
