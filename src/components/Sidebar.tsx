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
} from "lucide-react";

const studentLinks = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/teach-back", label: "Teach-Back (Toby)", icon: MessageSquare, badge: "1-on-1" },
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
  const { role, userName, setRole } = useAuth();

  const links = role === "teacher" ? teacherLinks : studentLinks;
  const roleLabel = role === "teacher" ? "Teacher Console" : "Student Portal";

  const handleLogout = () => {
    setRole(null);
    router.push("/");
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-md text-white shrink-0"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 m-0">
              Learn<span style={{ color: "var(--accent)" }}>AI</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 m-0 uppercase tracking-wider">
              {roleLabel}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav List */}
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
              <span className="truncate flex-1">{link.label}</span>
              {link.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Switch Role Card */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="p-3 rounded-2xl mb-2 flex items-center gap-3 bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
            {userName
              ? userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : role === "teacher" ? "DR" : "AM"}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-900 truncate m-0">
              {userName || (role === "teacher" ? "Dr. Priya Sharma" : "Arjun Mehta")}
            </p>
            <p className="text-[11px] text-slate-500 m-0 capitalize">
              {role || "Student"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-xs font-bold text-slate-500 hover:text-purple-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Switch Role / Home
        </button>
      </div>
    </aside>
  );
}
