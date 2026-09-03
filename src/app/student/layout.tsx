"use client";

import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";
import { StudentHeader } from "@/components/StudentHeader";
import { GamificationProvider } from "@/lib/gamificationContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isSidebarCollapsed } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && role !== "student") {
      router.push("/");
    }
  }, [role, router, mounted]);

  if (!mounted || role !== "student") return null;

  return (
    <GamificationProvider>
      <div className="flex min-h-screen flex-col bg-[#EEF1F7]">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <StudentHeader />
            <main
              className={`main-content flex-1 transition-all duration-300 p-4 sm:p-8 ${
                isSidebarCollapsed ? "!ml-0 px-6 sm:px-12" : ""
              }`}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </GamificationProvider>
  );
}
