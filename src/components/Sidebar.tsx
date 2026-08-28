"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  Upload,
  GitBranch,
  BarChart3,
  Users,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  BookOpen,
} from "lucide-react";

const studentLinks = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/chapters", label: "Chapters", icon: BookOpen },
  { href: "/student/teach-back", label: "Teach-Back (Toby)", icon: MessageSquare, badge: "AI" },
  { href: "/student/assessment", label: "Diagnostic Quiz", icon: ClipboardCheck },
  { href: "/student/progress", label: "Knowledge Radar", icon: TrendingUp },
];

const teacherLinks = [
  { href: "/teacher", label: "Class Overview", icon: LayoutDashboard },
  { href: "/teacher/class-gaps", label: "Class Gaps & Signals", icon: BarChart3, badge: "AI" },
  { href: "/teacher/concept-map", label: "Prerequisite Map", icon: GitBranch },
  { href: "/teacher/upload", label: "Upload & Extract", icon: Upload },
  { href: "/teacher/students", label: "Student Roster", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName, setRole, isSidebarCollapsed, toggleSidebar } = useAuth();

  const links = role === "teacher" ? teacherLinks : studentLinks;
  const roleLabel = role === "teacher" ? "Teacher Console" : "Student Portal";

  const handleLogout = () => {
    setRole(null);
    router.push("/");
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : role === "teacher"
    ? "PS"
    : "AM";

  return (
    <>
      {/* ── Collapsed Floating Open Button ── */}
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          aria-label="Open Sidebar"
          className="fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-white border border-[#EBE5DB] shadow-md text-[#18181B] hover:bg-[#F3EFE9] transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <PanelLeftOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`sidebar transition-transform duration-300 ease-in-out ${
          isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Brand Header with Collapse Button */}
        <div className="sidebar-brand flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-3 no-underline flex-1 min-w-0">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white bg-[#121216] shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-[#FEF0C3]" />
            </div>
            <div className="truncate">
              <h1 className="text-lg font-black tracking-tight text-[#18181B] m-0">
                Learn<span className="text-[#8B5CF6]">AI</span>
              </h1>
              <p className="text-[10px] font-bold text-[#71717A] m-0 uppercase tracking-wider">
                {roleLabel}
              </p>
            </div>
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleSidebar}
            aria-label="Collapse Sidebar"
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#EBE5DB] border border-[#EBE5DB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer shrink-0"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/student" &&
                link.href !== "/teacher" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 font-semibold text-xs">{link.label}</span>
                {link.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#E8DEFF] text-[#2D1B4E]"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto pt-4 border-t border-[#EBE5DB]">
          <div className="p-2.5 rounded-2xl mb-2 flex items-center gap-2.5 bg-[#F3EFE9]">
            <div className="w-8 h-8 rounded-full bg-[#121216] text-[#FAF8F5] font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-[#18181B] truncate m-0">
                {userName || (role === "teacher" ? "Dr. Priya Sharma" : "Arjun Mehta")}
              </p>
              <p className="text-[10px] text-[#71717A] m-0 capitalize">
                {role || "Student"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-xs font-bold text-[#71717A] hover:text-[#18181B] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Switch Role / Home
          </button>
        </div>
      </aside>

      {/* ── Mobile Floating Bottom Dock ── */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[360px]">
        <nav className="dock-nav">
          {links.slice(0, 4).map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/student" &&
                link.href !== "/teacher" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className={`dock-item ${isActive ? "active" : ""}`}
              >
                <link.icon className="w-5 h-5" />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            aria-label="Switch Profile"
            className="dock-item"
          >
            <User className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </>
  );
}
