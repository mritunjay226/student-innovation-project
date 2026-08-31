"use client";

import React, { useState, useRef, useEffect } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees (e.g. 10)
  glare?: boolean;
  scale?: number; // scale on hover (e.g. 1.02)
  onClick?: () => void;
  depthZ?: number; // 3D translation Z on hover
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  onClick,
  depthZ = 12,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Normalized from -1 to 1
    const normX = (x / width - 0.5) * 2;
    const normY = (y / height - 0.5) * 2;

    // Invert Y for standard natural 3D tilt
    const tiltX = -normY * maxTilt;
    const tiltY = normX * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlarePos({
      x: (x / width) * 100,
      y: (y / height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 transform-gpu cursor-pointer select-none ${className}`}
      style={{
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="w-full h-full relative preserve-3d rounded-[inherit] transition-all duration-300 ease-out"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${depthZ}px) scale3d(${scale}, ${scale}, 1)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
        }}
      >
        {children}

        {/* Dynamic Specular Glare Layer */}
        {glare && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.65), transparent 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
