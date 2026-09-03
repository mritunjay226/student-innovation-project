"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Users, Brain, TrendingUp, ChevronRight, Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function StudentsPage() {
  const users = useQuery(api.users.getAll, {});
  const classGaps = useQuery(api.mastery.getClassGaps, {});

  if (!users || !classGaps) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#2F65F6] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">Loading student profiles…</p>
        </div>
      </div>
    );
  }

  const students = users.filter((u) => u.role === "student");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Cohort Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
          Student Roster & Cohort Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
          Track individual learning velocity, active misconception genomes, and diagnostic trajectory.
        </p>
      </div>

      {/* ── 2. Roster Table Card ── */}
      <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F0F3F8] text-[#8C93A4] font-bold">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Grade Level</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Learning Velocity</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F8]">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      {student.avatar && (student.avatar.startsWith("http") || student.avatar.startsWith("/")) ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E2E6F0] shadow-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#FFE4D6] text-[#FF642F] border border-[#FFD2C0] flex items-center justify-center font-black text-xs shrink-0">
                          {student.avatar || student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                      )}
                      <div>
                        <span className="font-extrabold text-[#18181B] text-sm block leading-tight">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-[#8C93A4] font-bold block mt-0.5">
                          {student.email || `ID: #${student._id.substring(0, 8)}`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-bold text-[#7E8494] bg-[#F4F6FB] border border-[#E2E6F0] py-0.5 px-2.5 rounded-full">
                      {student.grade || "12th Grade"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden">
                        <div className="h-full rounded-full bg-[#2F65F6]" style={{ width: "72%" }} />
                      </div>
                      <span className="text-xs font-black text-[#18181B]">72%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      href="/student"
                      className="w-7 h-7 rounded-full bg-[#F4F6FB] hover:bg-[#EAEFF8] text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0] inline-flex items-center justify-center transition-colors"
                      title="Inspect Student"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 text-[#8C93A4]" />
            <p className="text-xs text-[#7E8494] font-medium m-0">No active students registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
