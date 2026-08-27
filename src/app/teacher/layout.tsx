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
  const { role } = useAuth();
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
