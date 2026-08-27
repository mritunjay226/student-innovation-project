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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl mx-auto mb-3 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-bold">Loading student profiles...</p>
        </div>
      </div>
    );
  }

  const students = users.filter((u) => u.role === "student");

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="announcement-badge mb-2 text-xs">
          <span>✨ Student Cohort Roster</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Student Roster & Cohort
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Track individual learning velocity, active misconceptions, and diagnostic history
        </p>
      </div>

      {/* Roster Cards */}
      <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-1">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade Level</th>
              <th>Status</th>
              <th>Learning Velocity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm text-white"
                      style={{
                        background: "var(--accent-gradient)",
                      }}
                    >
                      {student.avatar || student.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {student.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        ID: #{student._id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-purple">{student.grade || "12th Grade"}</span>
                </td>
                <td>
                  <span className="badge badge-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-20">
                      <div className="progress-bar-fill" style={{ width: "65%", background: "#7c3aed" }} />
                    </div>
                    <span className="text-xs font-extrabold text-purple-600">65%</span>
                  </div>
                </td>
                <td>
                  <Link
                    href="/student"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-500 hover:text-purple-600 inline-flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">No active students registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
