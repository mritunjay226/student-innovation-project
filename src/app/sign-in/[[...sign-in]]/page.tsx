"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Flame,
  Star,
  GraduationCap,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#DDE4F7] p-3 sm:p-6 lg:p-10 flex items-center justify-center text-[#1C1E23] font-sans antialiased selection:bg-[#FFE3D4] selection:text-[#C8400C] relative overflow-hidden">
      {/* ── Ambient Background Glow Waves ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none">
          <path
            d="M-100 200 C 300 100, 600 400, 1100 250 C 1400 150, 1600 350, 1700 450"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
          />
          <path
            d="M-50 450 C 400 350, 700 650, 1200 500 C 1500 400, 1700 600, 1800 700"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ── Main Container Shell ── */}
      <div className="w-full max-w-[1180px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_24px_80px_rgba(30,45,95,0.09)] border border-[#E6EAF2] p-6 sm:p-10 lg:p-12 relative z-10">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F2F4F8]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#7E8494] hover:text-[#181A20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl font-black text-[#FF642F] tracking-tight group-hover:opacity-90 transition-opacity">
              axiora
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF642F] -mb-1.5" />
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Column: Value Proposition & Interactive Socratic Showcase ── */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Pill & Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4D6] text-[#C8400C] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen STEM Cognitive Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#181A20] tracking-tight leading-tight m-0">
                Welcome back to <span className="text-[#FF642F]">Axiora</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#7E8494] font-medium leading-relaxed m-0">
                Sign in to continue your reverse Socratic tutoring, track prerequisite mastery radars, and review exam-targeted flashcards.
              </p>
            </div>

            {/* Socratic Interactive AI Card Preview */}
            <div className="bg-gradient-to-br from-[#F8FAFD] to-[#EEF2FB] rounded-[28px] p-5 sm:p-6 border border-[#E2E6F0] space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#181A20] flex items-center justify-center text-white text-xs font-black shadow-sm">
                    🤖
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#181A20]">Toby • AI Peer</div>
                    <div className="text-[10px] font-semibold text-[#8C93A4]">Physics • Optics</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" /> Active Session
                </span>
              </div>

              {/* Speech bubble */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E2E6F0] text-xs text-[#2A2E3D] font-medium leading-relaxed shadow-2xs">
                &ldquo;Wait, if light speeds up in a denser medium, shouldn&apos;t the wavelength increase? Can you teach me Snell&apos;s Law?&rdquo;
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                <span className="text-[#059669] flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> 90% Retention Rate
                </span>
                <span className="text-[#FF642F] flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-[#FF642F]" /> +50 XP Reward
                </span>
              </div>
            </div>

            {/* Value Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#555C6E] bg-white p-3 rounded-2xl border border-[#E2E6F0]">
                <div className="w-6 h-6 rounded-full bg-[#FFE4D6] text-[#FF642F] flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span>Socratic AI Peers</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#555C6E] bg-white p-3 rounded-2xl border border-[#E2E6F0]">
                <div className="w-6 h-6 rounded-full bg-[#C4F6EE] text-[#059669] flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Prereq Radar Graph</span>
              </div>
            </div>

            {/* Social Proof Strip */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#F2F4F8]">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Student"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-[11px] font-semibold text-[#7E8494]">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                  <span className="font-bold text-[#181A20] ml-1">4.9 / 5</span>
                </div>
                <span>Trusted by top STEM learners</span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Clerk Sign-In Form ── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[420px]">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-white shadow-[0_16px_50px_rgba(24,26,32,0.06)] border border-[#E6EAF2] rounded-[32px] p-6 sm:p-8 w-full",
                    headerTitle: "text-2xl font-black text-[#181A20] tracking-tight",
                    headerSubtitle: "text-xs font-semibold text-[#7E8494] mt-1",
                    socialButtonsBlockButton:
                      "rounded-full border border-[#E2E6F0] hover:bg-[#F8FAFD] text-xs font-bold text-[#181A20] py-2.5 transition-all shadow-2xs",
                    socialButtonsBlockButtonText: "font-bold text-xs text-[#181A20]",
                    dividerLine: "bg-[#E6EAF2]",
                    dividerText: "text-[10px] font-bold uppercase tracking-wider text-[#8C93A4] bg-white px-2",
                    formFieldLabel: "text-xs font-bold text-[#181A20] mb-1.5",
                    formFieldInput:
                      "rounded-2xl border border-[#E2E6F0] focus:border-[#FF642F] focus:ring-2 focus:ring-[#FF642F]/15 text-xs font-semibold py-3 px-4 bg-[#F8FAFD] transition-all",
                    formButtonPrimary:
                      "rounded-full bg-gradient-to-r from-[#FF642F] to-[#FF7844] hover:opacity-95 text-white font-black text-xs sm:text-sm py-3 px-6 shadow-md shadow-[#FF642F]/25 transition-all cursor-pointer hover:scale-[1.01]",
                    footerActionLink: "text-[#FF642F] font-bold text-xs hover:underline",
                    identityPreviewText: "text-xs font-bold text-[#181A20]",
                    identityPreviewEditButton: "text-[#FF642F] text-xs font-bold",
                  },
                }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
