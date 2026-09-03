"use client";

import { SignUp } from "@clerk/nextjs";
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
  BookOpen,
} from "lucide-react";

export default function SignUpPage() {
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
          
          {/* ── Left Column: Value Proposition & What You Get ── */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Pill & Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4D6] text-[#C8400C] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join 12,000+ STEM Scholars</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#181A20] tracking-tight leading-tight m-0">
                Unlock your intuitive <span className="text-[#FF642F]">STEM potential</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#7E8494] font-medium leading-relaxed m-0">
                Create your free Axiora account to access AI Socratic classmates, automated syllabus ingestion, and exam diagnostic mastery radar.
              </p>
            </div>

            {/* Feature Checklist Highlights */}
            <div className="space-y-3">
              {[
                {
                  title: "Reverse Socratic AI Tutoring",
                  desc: "Teach Toby, Maya, Leo & Sam. Cement 90% retention through the Feynman technique.",
                  icon: Brain,
                  bg: "bg-[#FFE4D6] text-[#FF642F]",
                },
                {
                  title: "Multimodal PDF to Flashcards",
                  desc: "Instantly convert textbook PDFs and lecture notes into Leitner SM-2 study decks.",
                  icon: BookOpen,
                  bg: "bg-[#C4F6EE] text-[#059669]",
                },
                {
                  title: "Real-Time Knowledge Radar",
                  desc: "Pinpoint hidden prerequisite blindspots across Mathematics, Physics, and Chemistry.",
                  icon: Layers,
                  bg: "bg-[#EBF3FE] text-[#2F65F6]",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="bg-[#F8FAFD] rounded-2xl p-4 border border-[#E6EAF2] flex items-start gap-3.5 hover:bg-white hover:border-[#E2E6F0] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl ${feat.bg} flex items-center justify-center shrink-0`}>
                    <feat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#181A20] m-0">{feat.title}</h3>
                    <p className="text-[11px] text-[#7E8494] font-medium m-0 mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
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
                <span>Rated #1 for STEM cognitive clarity</span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Clerk Sign-Up Form ── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[420px]">
              <SignUp
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
