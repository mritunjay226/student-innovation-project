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
  PanelLeftClose,
  PanelLeftOpen,
  User,
  BookOpen,
  Layers,
  Award,
} from "lucide-react";

const studentLinks = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/chapters", label: "Chapters", icon: BookOpen },
  { href: "/student/flashcards", label: "PDF Flashcards", icon: Layers, badge: "AI" },
  { href: "/student/teach-back", label: "Teach-Back (Toby)", icon: MessageSquare, badge: "AI" },
  { href: "/student/assessment", label: "Diagnostic Quiz", icon: ClipboardCheck },
  { href: "/student/progress", label: "Knowledge Radar", icon: TrendingUp },
  { href: "/student/badges", label: "Badges & Rewards", icon: Award, badge: "XP" },
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
  const { role, userName, userAvatar, userEmail, setRole, logout, isSidebarCollapsed, toggleSidebar } = useAuth();

  const links = role === "teacher" ? teacherLinks : studentLinks;
  const roleLabel = role === "teacher" ? "Teacher Console" : "Student Portal";

  const handleLogout = () => {
    logout();
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : role === "teacher"
    ? "PS"
    : "KW";

  return (
    <>
      {/* ── Collapsed Floating Open Button ── */}
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          aria-label="Open Sidebar"
          className="fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-white border border-[#E2E6F0] shadow-md text-[#181A20] hover:bg-[#F4F6FB] transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <PanelLeftOpen className="w-4 h-4 text-[#FF642F]" />
          <span className="hidden sm:inline">Menu</span>
        </button>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-[260px] bg-white border-r border-[#E6EAF2] flex flex-col p-5 transition-transform duration-300 ease-in-out select-none shadow-[2px_0_16px_rgba(0,0,0,0.02)] ${
          isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Brand Header with Emblem Logo */}
        <div className="flex items-center justify-between gap-2 pb-5 mb-3 border-b border-[#F0F3F8]">
          <Link href="/" className="flex items-center gap-2.5 no-underline flex-1 min-w-0 group">
            <span className="text-2xl font-black text-[#FF642F] tracking-tight group-hover:opacity-90 transition-opacity">
              axiora
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF642F] -mb-1.5" />
            <span className="text-[10px] font-bold text-[#8C93A4] uppercase tracking-wider bg-[#F4F6FB] border border-[#E2E6F0] px-2 py-0.5 rounded-full ml-auto">
              {role === "teacher" ? "Teacher" : "Student"}
            </span>
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleSidebar}
            aria-label="Collapse Sidebar"
            className="w-8 h-8 rounded-xl bg-[#F4F6FB] hover:bg-[#EAEFF8] border border-[#E2E6F0] flex items-center justify-center text-[#7E8494] hover:text-[#181A20] transition-colors cursor-pointer shrink-0"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto py-2 pr-1">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 group no-underline ${
                  isActive
                    ? "bg-[#FF642F] text-white shadow-sm shadow-[#FF642F]/25"
                    : "text-[#555C6E] hover:text-[#181A20] hover:bg-[#F4F6FB]"
                }`}
              >
                <link.icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[#8C93A4] group-hover:text-[#FF642F]"
                  }`}
                />
                <span className="truncate flex-1">{link.label}</span>
                {link.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : link.badge === "AI"
                        ? "bg-[#FFE4D6] text-[#C8400C]"
                        : "bg-[#FEF0C3] text-[#713F12]"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="pt-4 border-t border-[#F0F3F8] mt-auto">
          <div className="p-3 rounded-2xl mb-2 flex items-center gap-3 bg-[#F4F6FB] border border-[#E6EAF2]">
            {userAvatar && (userAvatar.startsWith("http") || userAvatar.startsWith("/")) ? (
              <img
                src={userAvatar}
                alt={userName || "Profile"}
                className="w-8 h-8 rounded-full object-cover border border-[#E2E6F0] shrink-0 shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF642F] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>
            )}
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-bold text-[#181A20] truncate m-0 leading-none mb-1">
                {userName || (role === "teacher" ? "Dr. Priya Sharma" : "Kristin Watson")}
              </p>
              <p className="text-[10px] font-semibold text-[#8C93A4] m-0 capitalize leading-none truncate">
                {userEmail || (role === "teacher" ? "STEM Faculty" : "Class 12 STEM")}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-bold text-[#7E8494] hover:text-[#181A20] hover:bg-[#F4F6FB] transition-colors cursor-pointer border border-transparent hover:border-[#E2E6F0]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Role / Home</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Floating Bottom Dock ── */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px]">
        <nav className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E6F0] flex items-center justify-around">
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
                className={`p-2 rounded-full transition-colors ${
                  isActive ? "bg-[#FF642F] text-white" : "text-[#7E8494] hover:text-[#181A20]"
                }`}
              >
                <link.icon className="w-5 h-5" />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            aria-label="Switch Profile"
            className="p-2 rounded-full text-[#7E8494] hover:text-[#181A20]"
          >
            <User className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </>
  );
}
