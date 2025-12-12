"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SkillData {
  name: string;
  level: number; // 0-100
  color?: string;
}

interface SkillRadarProps {
  skills: SkillData[];
  size?: number;
}

export function SkillRadar({ skills, size = 300 }: SkillRadarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const center = size / 2;
  const maxRadius = (size / 2) * 0.8;
  const levels = 5;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const polygonPoints = skills
    .map((skill, i) => {
      const point = getPoint(i, skill.level);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        {Array.from({ length: levels }).map((_, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={(maxRadius * (i + 1)) / levels}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const point = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Skill area */}
        <motion.polygon
          points={polygonPoints}
          fill="url(#skillGradient)"
          stroke="#64d2ff"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={isVisible ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64d2ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f7b500" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Skill points */}
        {skills.map((skill, i) => {
          const point = getPoint(i, skill.level);
          const labelPoint = getPoint(i, 115);

          return (
            <g key={skill.name}>
              {/* Point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#64d2ff"
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="#64d2ff"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 0.2 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              />

              {/* Label */}
              <motion.text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white/80 text-xs font-medium"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {skill.name}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs text-white/70">{skill.name}</span>
            <span className="ml-auto text-xs font-medium text-accent">{skill.level}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

