"use client";

import React from "react";

interface IllustrationProps {
  className?: string;
}

// ══════════════════════════════════════════════════════════════
// 1. MATHEMATICS ILLUSTRATIONS (3 Unique 2D Vector Artworks)
// ══════════════════════════════════════════════════════════════

/** Math 1: Golden Ratio Spiral & Geometric Polyhedron */
export function MathGoldenGeometry({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:rotate-2`}
    >
      <defs>
        <linearGradient id="mathGoldGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="polyGrad" x1="90" y1="30" x2="145" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Floating Geometric Polyhedron */}
      <polygon points="120,25 145,55 135,90 95,95 85,60 100,30" fill="url(#polyGrad)" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="120" y1="25" x2="115" y2="60" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />
      <line x1="145" y1="55" x2="115" y2="60" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />
      <line x1="135" y1="90" x2="115" y2="60" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />
      <line x1="95" y1="95" x2="115" y2="60" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />
      <line x1="85" y1="60" x2="115" y2="60" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />

      {/* Golden Ratio Spiral Curve */}
      <path
        d="M 140,140 A 120,120 0 0,0 20,20 A 80,80 0 0,0 20,100 A 50,50 0 0,0 70,100 A 30,30 0 0,0 70,70 A 18,18 0 0,0 52,70"
        stroke="url(#mathGoldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Coordinate Crosshairs & Geometric Accents */}
      <line x1="10" y1="140" x2="150" y2="140" stroke="#7C3AED" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.4" />
      <line x1="20" y1="10" x2="20" y2="150" stroke="#7C3AED" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.4" />

      {/* Floating Sparkles & Math Icons */}
      <circle cx="35" cy="45" r="4" fill="#EC4899" opacity="0.7" />
      <circle cx="65" cy="30" r="2.5" fill="#8B5CF6" opacity="0.8" />
      <circle cx="130" cy="120" r="3.5" fill="#F59E0B" opacity="0.75" />
      <path d="M 45,120 L 50,115 L 55,120 L 50,125 Z" fill="#8B5CF6" opacity="0.6" />
    </svg>
  );
}

/** Math 2: Flowing Calculus Infinity & Harmonic Wave */
export function MathCalculusInfinity({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:-rotate-2`}
    >
      <defs>
        <linearGradient id="calcWaveGrad" x1="10" y1="80" x2="150" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="infinityFill" x1="30" y1="40" x2="130" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Sine Wave Grid */}
      <path
        d="M 10,95 Q 40,40 80,95 T 150,95"
        stroke="#6366F1"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
        opacity="0.4"
      />

      {/* Luminous Infinity Ribbon */}
      <path
        d="M 80,80 C 60,50 30,50 30,80 C 30,110 60,110 80,80 C 100,50 130,50 130,80 C 130,110 100,110 80,80 Z"
        fill="url(#infinityFill)"
        stroke="url(#calcWaveGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Integral Sign & Derivative Accents */}
      <path
        d="M 28,35 C 32,25 36,25 36,32 L 36,55 C 36,62 32,62 28,60"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Geometric Shards */}
      <polygon points="125,30 132,38 122,42" fill="#F43F5E" opacity="0.6" />
      <polygon points="40,125 46,132 38,136" fill="#06B6D4" opacity="0.7" />
      <circle cx="140" cy="65" r="3" fill="#8B5CF6" opacity="0.8" />
      <circle cx="95" cy="40" r="2" fill="#EC4899" opacity="0.8" />
    </svg>
  );
}

/** Math 3: Isometric Coordinate Matrix & Trig Geometry */
export function MathIsometricMatrix({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:rotate-3`}
    >
      <defs>
        <linearGradient id="cubeGrad1" x1="40" y1="50" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="cubeGrad2" x1="70" y1="70" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Trig Triangle Ruler */}
      <polygon points="30,130 130,130 130,30" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" opacity="0.5" />
      <polygon points="55,120 115,120 115,60" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Floating Isometric Pastel Cube */}
      <g transform="translate(10, -5)">
        {/* Top face */}
        <polygon points="55,45 80,30 105,45 80,60" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        {/* Left face */}
        <polygon points="55,45 80,60 80,90 55,75" fill="#FCD34D" stroke="#B45309" strokeWidth="1.2" />
        {/* Right face */}
        <polygon points="105,45 80,60 80,90 105,75" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
      </g>

      {/* Angle Arc & Coordinates */}
      <path d="M 50,130 A 20,20 0 0,0 45,115" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="130" cy="30" r="4" fill="#EF4444" opacity="0.8" />
      <circle cx="30" cy="130" r="4" fill="#3B82F6" opacity="0.8" />
      <circle cx="130" cy="130" r="4" fill="#10B981" opacity="0.8" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// 2. PHYSICS ILLUSTRATIONS (3 Unique 2D Vector Artworks)
// ══════════════════════════════════════════════════════════════

/** Physics 1: Quantum Atomic Orbitals & Energy Particles */
export function PhysicsQuantumOrbital({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:rotate-6`}
    >
      <defs>
        <linearGradient id="atomCoreGrad" x1="70" y1="70" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <radialGradient id="atomGlow" cx="80" cy="80" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Energy Glow Aura */}
      <circle cx="80" cy="80" r="35" fill="url(#atomGlow)" />

      {/* Orbit 1 (Horizontal tilt) */}
      <ellipse cx="80" cy="80" rx="58" ry="22" stroke="#0284C7" strokeWidth="2" strokeDasharray="6 3" transform="rotate(-30 80 80)" opacity="0.75" />
      <circle cx="125" cy="55" r="5" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Orbit 2 (Opposite tilt) */}
      <ellipse cx="80" cy="80" rx="58" ry="22" stroke="#8B5CF6" strokeWidth="2" transform="rotate(45 80 80)" opacity="0.7" />
      <circle cx="40" cy="40" r="4.5" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Orbit 3 (Vertical) */}
      <ellipse cx="80" cy="80" rx="58" ry="20" stroke="#10B981" strokeWidth="1.8" strokeDasharray="4 2" transform="rotate(100 80 80)" opacity="0.65" />
      <circle cx="95" cy="132" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Luminous Quantum Nucleus */}
      <circle cx="80" cy="80" r="12" fill="url(#atomCoreGrad)" stroke="#FFFFFF" strokeWidth="2" shadow-md="true" />
      <circle cx="76" cy="76" r="3.5" fill="#FFFFFF" opacity="0.8" />

      {/* Floating Sparkles */}
      <circle cx="30" cy="115" r="2.5" fill="#38BDF8" opacity="0.8" />
      <circle cx="135" cy="110" r="2.5" fill="#A855F7" opacity="0.8" />
    </svg>
  );
}

/** Physics 2: Gravitational Waves, Trajectory & Pendulum */
export function PhysicsGravityPendulum({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:-rotate-3`}
    >
      <defs>
        <linearGradient id="planetGrad" x1="90" y1="80" x2="140" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
      </defs>

      {/* Gravitational Wave Ripple Arcs */}
      <path d="M 20,130 Q 80,70 140,130" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M 35,138 Q 80,95 125,138" stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="4 3" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Pendulum Cord & Bob */}
      <line x1="60" y1="20" x2="60" y2="85" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="60" cy="20" r="3" fill="#1E293B" />
      <circle cx="60" cy="90" r="10" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M 40,105 A 75,75 0 0,0 80,105" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Floating Planet with Ring */}
      <g transform="translate(10, 0)">
        <ellipse cx="115" cy="45" rx="26" ry="7" stroke="#FBBF24" strokeWidth="2" transform="rotate(-20 115 45)" opacity="0.85" />
        <circle cx="115" cy="45" r="15" fill="url(#planetGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="110" cy="40" r="4" fill="#FFFFFF" opacity="0.4" />
      </g>

      {/* Velocity Vectors (Arrow) */}
      <line x1="72" y1="92" x2="95" y2="80" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="95,80 87,78 90,86" fill="#10B981" />
    </svg>
  );
}

/** Physics 3: Optical Glass Prism with Refracting Rainbow Spectrum */
export function PhysicsOpticsPrism({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:rotate-2`}
    >
      <defs>
        <linearGradient id="prismGlass" x1="40" y1="35" x2="105" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Incoming Incident White Light Beam */}
      <line x1="15" y1="95" x2="62" y2="80" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Triangular Crystalline Prism */}
      <polygon points="75,25 125,120 25,120" fill="url(#prismGlass)" stroke="#0284C7" strokeWidth="2" strokeLinejoin="round" />

      {/* Dispersing Rainbow Spectral Beams */}
      <line x1="90" y1="78" x2="150" y2="55" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="93" y1="84" x2="152" y2="68" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="96" y1="90" x2="152" y2="82" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="98" y1="96" x2="150" y2="96" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="100" y1="102" x2="148" y2="110" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" />

      {/* Optical Sparkle Highlights */}
      <circle cx="75" cy="25" r="3" fill="#38BDF8" />
      <circle cx="125" cy="120" r="3" fill="#38BDF8" />
      <circle cx="25" cy="120" r="3" fill="#38BDF8" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// 3. CHEMISTRY ILLUSTRATIONS (3 Unique 2D Vector Artworks)
// ══════════════════════════════════════════════════════════════

/** Chemistry 1: Conical Flask with Effervescent Reaction & Bubbles */
export function ChemLabFlask({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:-rotate-3`}
    >
      <defs>
        <linearGradient id="chemFluid" x1="40" y1="85" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Glass Flask Body */}
      <path
        d="M 70,25 L 90,25 L 90,55 L 125,120 C 128,128 122,135 115,135 L 45,135 C 38,135 32,128 35,120 L 70,55 Z"
        fill="#FFFFFF"
        fillOpacity="0.5"
        stroke="#065F46"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Lip at Top */}
      <rect x="66" y="20" width="28" height="6" rx="3" fill="#047857" />

      {/* Liquid Fill */}
      <path
        d="M 52,90 Q 80,82 108,90 L 120,118 C 122,125 118,130 112,130 L 48,130 C 42,130 38,125 40,118 Z"
        fill="url(#chemFluid)"
        opacity="0.85"
      />

      {/* Effervescent Rising Bubbles */}
      <circle cx="65" cy="110" r="4.5" fill="#A7F3D0" />
      <circle cx="85" cy="118" r="3.5" fill="#A7F3D0" />
      <circle cx="95" cy="100" r="5" fill="#A7F3D0" />
      <circle cx="75" cy="70" r="4" fill="#10B981" opacity="0.8" />
      <circle cx="85" cy="50" r="3" fill="#34D399" opacity="0.85" />
      <circle cx="78" cy="32" r="2.5" fill="#6EE7B7" opacity="0.9" />

      {/* Floating Sparkles & Atoms */}
      <polygon points="135,50 140,58 132,60" fill="#F59E0B" opacity="0.8" />
      <circle cx="28" cy="70" r="3.5" fill="#10B981" opacity="0.7" />
    </svg>
  );
}

/** Chemistry 2: Benzene Ring & Covalent Molecular Lattice */
export function ChemMolecularLattice({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:rotate-4`}
    >
      <defs>
        <linearGradient id="benzeneGrad" x1="40" y1="40" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
      </defs>

      {/* Central Hexagonal Benzene Ring */}
      <polygon points="80,30 120,53 120,99 80,122 40,99 40,53" stroke="#E11D48" strokeWidth="2.5" fill="#FFE4E6" fillOpacity="0.4" strokeLinejoin="round" />
      <circle cx="80" cy="76" r="22" stroke="#E11D48" strokeWidth="1.8" strokeDasharray="5 3" fill="none" opacity="0.75" />

      {/* Covalent Atom Nodes */}
      <circle cx="80" cy="30" r="7" fill="url(#benzeneGrad)" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="120" cy="53" r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="120" cy="99" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="80" cy="122" r="7" fill="url(#benzeneGrad)" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="40" cy="99" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="40" cy="53" r="6" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.8" />

      {/* Attached Branch Bonds */}
      <line x1="80" y1="30" x2="80" y2="10" stroke="#E11D48" strokeWidth="2" />
      <circle cx="80" cy="10" r="4.5" fill="#E11D48" />

      <line x1="120" y1="99" x2="142" y2="112" stroke="#10B981" strokeWidth="2" />
      <circle cx="142" cy="112" r="4.5" fill="#10B981" />

      <line x1="40" y1="53" x2="18" y2="40" stroke="#8B5CF6" strokeWidth="2" />
      <circle cx="18" cy="40" r="4.5" fill="#8B5CF6" />
    </svg>
  );
}

/** Chemistry 3: DNA Double Helix Ribbon & Atomic Bonds */
export function ChemDnaHelix({ className = "w-28 h-28" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none pointer-events-none transition-transform duration-300 group-hover:scale-108 group-hover:-rotate-2`}
    >
      <defs>
        <linearGradient id="dnaGrad1" x1="30" y1="20" x2="130" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      {/* Base Pair Rungs */}
      <line x1="50" y1="30" x2="110" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="30" r="2.5" fill="#64748B" />

      <line x1="60" y1="55" x2="100" y2="55" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="55" r="2.5" fill="#64748B" />

      <line x1="50" y1="80" x2="110" y2="80" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="80" r="2.5" fill="#64748B" />

      <line x1="60" y1="105" x2="100" y2="105" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="105" r="2.5" fill="#64748B" />

      <line x1="50" y1="130" x2="110" y2="130" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="130" r="2.5" fill="#64748B" />

      {/* Strand 1 Sine Wave */}
      <path
        d="M 50,15 Q 110,40 50,80 Q 110,120 50,145"
        stroke="url(#dnaGrad1)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Strand 2 Cosine Wave */}
      <path
        d="M 110,15 Q 50,40 110,80 Q 50,120 110,145"
        stroke="#10B981"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Floating Sparkles & Ions */}
      <circle cx="30" cy="60" r="3" fill="#EC4899" opacity="0.8" />
      <circle cx="130" cy="95" r="3" fill="#3B82F6" opacity="0.8" />
      <circle cx="125" cy="40" r="2.5" fill="#F59E0B" opacity="0.8" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// Helper function to pick the matching illustration
// ══════════════════════════════════════════════════════════════
export function getChapterIllustration(subject: string, index: number, className?: string) {
  const s = subject.toLowerCase();

  if (s.includes("math")) {
    const variant = index % 3;
    if (variant === 0) return <MathGoldenGeometry className={className} />;
    if (variant === 1) return <MathCalculusInfinity className={className} />;
    return <MathIsometricMatrix className={className} />;
  }

  if (s.includes("physic")) {
    const variant = index % 3;
    if (variant === 0) return <PhysicsQuantumOrbital className={className} />;
    if (variant === 1) return <PhysicsGravityPendulum className={className} />;
    return <PhysicsOpticsPrism className={className} />;
  }

  if (s.includes("chem")) {
    const variant = index % 3;
    if (variant === 0) return <ChemLabFlask className={className} />;
    if (variant === 1) return <ChemMolecularLattice className={className} />;
    return <ChemDnaHelix className={className} />;
  }

  // Fallback
  return <MathGoldenGeometry className={className} />;
}
