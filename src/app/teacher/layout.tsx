"use client";

import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherLayout({
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
    if (mounted && role !== "teacher") {
      router.push("/");
    }
  }, [role, router, mounted]);

  if (!mounted || role !== "teacher") return null;

  return (
    <div className="flex min-h-screen bg-[#EEF1F7]">
      <Sidebar />
      <main
        className={`main-content flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "!ml-0 px-6 sm:px-12 pt-16" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
