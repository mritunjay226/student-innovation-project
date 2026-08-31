"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Brain, Atom, Sigma, Zap, Activity } from "lucide-react";

interface FloatingToken {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  top: string;
  left: string;
  depth: number; // 0.2 to 1.8 for parallax speed
  colorClass: string;
  floatDelay: string;
  type: "pill" | "formula" | "node";
}

const TOKENS: FloatingToken[] = [
  {
    id: "t1",
    label: "lim x→0 (sin x / x) = 1",
    top: "14%",
    left: "6%",
    depth: 0.7,
    colorClass: "bg-purple-100/70 border-purple-200 text-purple-900",
    floatDelay: "0s",
    type: "formula",
  },
  {
    id: "t2",
    label: "Δx · Δp ≥ ℏ / 2",
    top: "22%",
    left: "82%",
    depth: 0.9,
    colorClass: "bg-sky-100/70 border-sky-200 text-sky-900",
    floatDelay: "1.2s",
    type: "formula",
  },
  {
    id: "t3",
    label: "Root Gap: Vector Decomposition",
    icon: Brain,
    top: "38%",
    left: "4%",
    depth: 1.2,
    colorClass: "bg-amber-100/80 border-amber-200 text-amber-900",
    floatDelay: "0.8s",
    type: "pill",
  },
  {
    id: "t4",
    label: "Toby's Intuition: +38%",
    icon: Sparkles,
    top: "42%",
    left: "88%",
    depth: 1.1,
    colorClass: "bg-emerald-100/80 border-emerald-200 text-emerald-900",
    floatDelay: "2s",
    type: "pill",
  },
  {
    id: "t5",
    label: "∇ × E = -∂B/∂t",
    top: "68%",
    left: "8%",
    depth: 0.8,
    colorClass: "bg-rose-100/70 border-rose-200 text-rose-900",
    floatDelay: "1.5s",
    type: "formula",
  },
  {
    id: "t6",
    label: "Misconception: Sign Inversion",
    icon: Zap,
    top: "74%",
    left: "84%",
    depth: 1.3,
    colorClass: "bg-indigo-100/80 border-indigo-200 text-indigo-900",
    floatDelay: "0.4s",
    type: "pill",
  },
  {
    id: "t7",
    label: "e^(iπ) + 1 = 0",
    top: "88%",
    left: "15%",
    depth: 0.6,
    colorClass: "bg-teal-100/70 border-teal-200 text-teal-900",
    floatDelay: "2.4s",
    type: "formula",
  },
  {
    id: "t8",
    label: "Live Socratic Sync",
    icon: Activity,
    top: "85%",
    left: "75%",
    depth: 1.0,
    colorClass: "bg-purple-100/80 border-purple-200 text-purple-900",
    floatDelay: "1.8s",
    type: "pill",
  },
];

export function ParallaxBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetPos.current = { x, y };
    };

    const handleScroll = () => {
      setScrollY(window.scrollY || 0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Smooth lerp loop
    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.06;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.06;
      setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 min-h-full w-full pointer-events-none overflow-hidden select-none -z-10">
      {/* ── Background Dot Grid Pattern Across Entire Document ── */}
      <div className="absolute inset-0 grid-dots-pattern opacity-40" />

      {/* ── Radiant Ambient Mesh Gradient Orbs Across Document Height ── */}
      {/* Top Hero Ambient Orb */}
      <div
        className="absolute w-[650px] h-[650px] rounded-full blur-[120px] opacity-50 bg-gradient-to-br from-[#E8DEFF] via-[#D2F1E6] to-transparent"
        style={{
          top: "2%",
          left: "8%",
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Mid-Hero / Simulator Ambient Orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[130px] opacity-45 bg-gradient-to-tr from-[#FEF0C3] via-[#FCD5CE] to-transparent"
        style={{
          top: "22%",
          right: "4%",
          transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 25}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Feature Pillars Ambient Orb */}
      <div
        className="absolute w-[650px] h-[650px] rounded-full blur-[120px] opacity-45 bg-gradient-to-bl from-[#D6E8FA] via-[#E8DEFF] to-transparent"
        style={{
          top: "48%",
          left: "15%",
          transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -18}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Curriculum & FAQ Ambient Orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[125px] opacity-40 bg-gradient-to-tr from-[#D2F1E6] via-[#FEF0C3] to-transparent"
        style={{
          top: "72%",
          right: "10%",
          transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Bottom CTA Ambient Orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-35 bg-gradient-to-tl from-[#E8DEFF] via-[#D6E8FA] to-transparent"
        style={{
          bottom: "3%",
          left: "20%",
          transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      />

      {/* ── Floating Math, Physics & Diagnostic Tokens ── */}
      <div className="hidden lg:block absolute inset-0 min-h-full">
        {TOKENS.map((token) => {
          const Icon = token.icon;
          const translateX = mousePos.x * token.depth * 28;
          const translateY = mousePos.y * token.depth * 28;

          return (
            <div
              key={token.id}
              className={`absolute transition-transform duration-100 ease-out animate-float-slow`}
              style={{
                top: token.top,
                left: token.left,
                animationDelay: token.floatDelay,
                transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
              }}
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm font-mono text-[11px] font-semibold tracking-tight transition-all duration-300 ${token.colorClass} hover:scale-110`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                <span>{token.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Decorative Subtle Isometric Axis Crosshairs ── */}
      <div
        className="absolute top-[8%] left-[2%] opacity-30 text-xs font-mono text-[#71717A] hidden xl:flex flex-col gap-1"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
          <span>SOCRATIC_KERNEL::ONLINE</span>
        </div>
        <span className="text-[10px] opacity-60">LATENCY: 12ms • GRAPH_NODES: 148</span>
      </div>

      <div
        className="absolute top-[12%] right-[2%] opacity-30 text-xs font-mono text-[#71717A] hidden xl:flex flex-col items-end gap-1"
        style={{
          transform: `translate3d(${mousePos.x * -14}px, ${mousePos.y * -14}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2">
          <span>PREREQUISITE_TREE::LIVE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[10px] opacity-60">ROOT_GAP_ENGINE::v2.4</span>
      </div>
    </div>
  );
}
