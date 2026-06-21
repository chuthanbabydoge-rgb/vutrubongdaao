import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface PitchEvent {
  id?: number;
  type: string;
  minute: number;
  playerName?: string | null;
  teamId?: number | null;
  description?: string | null;
}

interface PlayerDot {
  x: number; y: number; label: string;
}

export type FormationKey = "4-4-2" | "4-3-3" | "3-5-2" | "4-2-3-1" | "5-3-2";

const FORMATIONS: Record<FormationKey, PlayerDot[]> = {
  "4-4-2": [
    { x: 50, y: 93, label: "GK" },
    { x: 15, y: 78, label: "LB" }, { x: 37, y: 76, label: "CB" }, { x: 63, y: 76, label: "CB" }, { x: 85, y: 78, label: "RB" },
    { x: 12, y: 57, label: "LM" }, { x: 37, y: 53, label: "CM" }, { x: 63, y: 53, label: "CM" }, { x: 88, y: 57, label: "RM" },
    { x: 38, y: 33, label: "ST" }, { x: 62, y: 33, label: "ST" },
  ],
  "4-3-3": [
    { x: 50, y: 93, label: "GK" },
    { x: 15, y: 78, label: "LB" }, { x: 37, y: 76, label: "CB" }, { x: 63, y: 76, label: "CB" }, { x: 85, y: 78, label: "RB" },
    { x: 28, y: 53, label: "CM" }, { x: 50, y: 49, label: "CM" }, { x: 72, y: 53, label: "CM" },
    { x: 18, y: 28, label: "LW" }, { x: 50, y: 25, label: "ST" }, { x: 82, y: 28, label: "RW" },
  ],
  "3-5-2": [
    { x: 50, y: 93, label: "GK" },
    { x: 25, y: 78, label: "CB" }, { x: 50, y: 76, label: "CB" }, { x: 75, y: 78, label: "CB" },
    { x: 10, y: 57, label: "LM" }, { x: 30, y: 52, label: "CM" }, { x: 50, y: 50, label: "CM" }, { x: 70, y: 52, label: "CM" }, { x: 90, y: 57, label: "RM" },
    { x: 37, y: 31, label: "ST" }, { x: 63, y: 31, label: "ST" },
  ],
  "4-2-3-1": [
    { x: 50, y: 93, label: "GK" },
    { x: 15, y: 78, label: "LB" }, { x: 37, y: 76, label: "CB" }, { x: 63, y: 76, label: "CB" }, { x: 85, y: 78, label: "RB" },
    { x: 35, y: 63, label: "CDM" }, { x: 65, y: 63, label: "CDM" },
    { x: 15, y: 47, label: "LW" }, { x: 50, y: 44, label: "CAM" }, { x: 85, y: 47, label: "RW" },
    { x: 50, y: 27, label: "ST" },
  ],
  "5-3-2": [
    { x: 50, y: 93, label: "GK" },
    { x: 10, y: 78, label: "LWB" }, { x: 28, y: 76, label: "CB" }, { x: 50, y: 75, label: "CB" }, { x: 72, y: 76, label: "CB" }, { x: 90, y: 78, label: "RWB" },
    { x: 27, y: 52, label: "CM" }, { x: 50, y: 49, label: "CM" }, { x: 73, y: 52, label: "CM" },
    { x: 37, y: 30, label: "ST" }, { x: 63, y: 30, label: "ST" },
  ],
};

function mirrorPos(p: PlayerDot): PlayerDot {
  return { x: 100 - p.x, y: 100 - p.y, label: p.label };
}

interface Pitch2DProps {
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  minute?: number;
  events?: PitchEvent[];
  formation?: FormationKey;
  awayFormation?: FormationKey;
  animating?: boolean;
  highlightLabel?: string;
  className?: string;
}

interface FloatingEvent {
  id: string;
  type: string;
  text: string;
  x: number;
  y: number;
  at: number;
}

export function Pitch2D({
  homeTeamName = "Đội Nhà",
  awayTeamName = "Đội Khách",
  homeTeamId,
  awayTeamId,
  homeScore = 0,
  awayScore = 0,
  minute = 0,
  events = [],
  formation = "4-4-2",
  awayFormation = "4-4-2",
  animating = false,
  highlightLabel,
  className = "",
}: Pitch2DProps) {
  const W = 700; const H = 460;
  const PL = 50; const PT = 20; const PW = 600; const PH = 420;
  const px = (xPct: number) => PL + (xPct / 100) * PW;
  const py = (yPct: number) => PT + (yPct / 100) * PH;

  // Ball position — interpolate toward last goal or center
  const [ballPos, setBallPos] = useState({ x: px(50), y: py(50) });
  const [floatingEvents, setFloatingEvents] = useState<FloatingEvent[]>([]);
  const frameRef = useRef(0);
  const prevMinuteRef = useRef(0);
  const [now, setNow] = useState(Date.now);

  // Animate ball
  useEffect(() => {
    if (!animating) return;
    let raf: number;
    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      const nx = px(50 + Math.sin(t * 1.3) * 28 + Math.sin(t * 0.7 + 1) * 12);
      const ny = py(50 + Math.cos(t * 0.9) * 22 + Math.sin(t * 1.1 + 2) * 10);
      setBallPos({ x: nx, y: ny });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [animating]);

  // Floating event pop-ups when new event crosses current minute
  useEffect(() => {
    const recentEvents = events.filter(e => e.minute <= minute && e.minute > prevMinuteRef.current);
    prevMinuteRef.current = minute;
    if (recentEvents.length === 0) return;

    const newFloat: FloatingEvent[] = recentEvents.map((e) => {
      const isHome = e.teamId === homeTeamId;
      const x = isHome ? px(35) : px(65);
      const y = isHome ? py(35) : py(65);
      const icon = e.type === "goal" ? "⚽" : e.type === "yellow_card" ? "🟨" : e.type === "assist" ? "🎯" : "📌";
      return {
        id: `${e.minute}-${e.type}-${Math.random()}`,
        type: e.type,
        text: `${icon} ${e.playerName ?? ""} ${e.minute}'`,
        x, y,
        at: Date.now(),
      };
    });
    setFloatingEvents(prev => [...prev, ...newFloat].slice(-6));
    // Ball to goal area
    const goals = recentEvents.filter(e => e.type === "goal");
    if (goals.length > 0) {
      const isHome = goals[0].teamId === homeTeamId;
      setBallPos({ x: px(isHome ? 50 : 50), y: py(isHome ? 8 : 92) });
    }
  }, [minute, events]);

  // Clean up old floating events
  useEffect(() => {
    const t = setInterval(() => {
      setFloatingEvents(prev => prev.filter(e => Date.now() - e.at < 3500));
      setNow(Date.now());
    }, 500);
    return () => clearInterval(t);
  }, []);

  const homePos = FORMATIONS[formation] ?? FORMATIONS["4-4-2"];
  const awayPos = (FORMATIONS[awayFormation] ?? FORMATIONS["4-4-2"]).map(mirrorPos);

  const goalEvents = events.filter(e => e.type === "goal" && e.minute <= minute);

  return (
    <div className={`relative select-none ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: "transparent" }}>
        {/* Pitch background with stripes */}
        <defs>
          <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a1a" />
            <stop offset="100%" stopColor="#163d16" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Pitch */}
        <rect x={PL} y={PT} width={PW} height={PH} fill="url(#pitchGrad)" rx="4" />
        {/* Stripes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={PL + i * (PW / 10)} y={PT} width={PW / 10} height={PH}
            fill={i % 2 === 0 ? "rgba(0,0,0,0.07)" : "transparent"} />
        ))}

        {/* Lines */}
        <g stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none">
          {/* Boundary */}
          <rect x={PL} y={PT} width={PW} height={PH} />
          {/* Halfway */}
          <line x1={PL} y1={PT + PH / 2} x2={PL + PW} y2={PT + PH / 2} />
          {/* Center circle */}
          <circle cx={PL + PW / 2} cy={PT + PH / 2} r={PH * 0.12} />
          <circle cx={PL + PW / 2} cy={PT + PH / 2} r="3" fill="white" />
          {/* Home penalty area (bottom) */}
          <rect x={PL + PW * 0.22} y={PT + PH * 0.75} width={PW * 0.56} height={PH * 0.25} />
          <rect x={PL + PW * 0.36} y={PT + PH * 0.87} width={PW * 0.28} height={PH * 0.13} />
          {/* Away penalty area (top) */}
          <rect x={PL + PW * 0.22} y={PT} width={PW * 0.56} height={PH * 0.25} />
          <rect x={PL + PW * 0.36} y={PT} width={PW * 0.28} height={PH * 0.13} />
          {/* Goals */}
          <rect x={PL + PW * 0.42} y={PT - 8} width={PW * 0.16} height={9} fill="rgba(255,255,255,0.15)" />
          <rect x={PL + PW * 0.42} y={PT + PH - 1} width={PW * 0.16} height={9} fill="rgba(255,255,255,0.15)" />
          {/* Corner arcs */}
          <path d={`M ${PL} ${PT + 10} A 10 10 0 0 1 ${PL + 10} ${PT}`} />
          <path d={`M ${PL + PW - 10} ${PT} A 10 10 0 0 1 ${PL + PW} ${PT + 10}`} />
          <path d={`M ${PL} ${PT + PH - 10} A 10 10 0 0 0 ${PL + 10} ${PT + PH}`} />
          <path d={`M ${PL + PW - 10} ${PT + PH} A 10 10 0 0 0 ${PL + PW} ${PT + PH - 10}`} />
          {/* Penalty spots */}
          <circle cx={PL + PW / 2} cy={PT + PH * 0.82} r="2" fill="white" />
          <circle cx={PL + PW / 2} cy={PT + PH * 0.18} r="2" fill="white" />
        </g>

        {/* Away players (blue, top half) */}
        {awayPos.map((p, i) => {
          const cx = px(p.x); const cy = py(p.y);
          return (
            <g key={`away-${i}`}>
              <circle cx={cx} cy={cy} r="9" fill="#1d4ed8" stroke="white" strokeWidth="1.5" opacity="0.9" />
              <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
                fontSize="6" fill="white" fontWeight="bold" fontFamily="monospace">{p.label}</text>
            </g>
          );
        })}

        {/* Home players (green, bottom half) */}
        {homePos.map((p, i) => {
          const cx = px(p.x); const cy = py(p.y);
          const isHighlighted = highlightLabel && p.label === highlightLabel;
          return (
            <g key={`home-${i}`}>
              {isHighlighted && (
                <circle cx={cx} cy={cy} r="14" fill="none" stroke="#fbbf24" strokeWidth="2"
                  opacity="0.8">
                  <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r="9" fill={isHighlighted ? "#16a34a" : "#22c55e"} stroke={isHighlighted ? "#fbbf24" : "white"} strokeWidth="1.5" opacity="0.95" />
              <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
                fontSize="6" fill="white" fontWeight="bold" fontFamily="monospace">{p.label}</text>
            </g>
          );
        })}

        {/* Ball */}
        <circle cx={ballPos.x} cy={ballPos.y} r="7" fill="white" stroke="#333" strokeWidth="1.5" filter={animating ? "url(#glow)" : undefined} opacity="0.95" />
        <circle cx={ballPos.x} cy={ballPos.y} r="7" fill="none" stroke="#ccc" strokeWidth="0.5"
          strokeDasharray="4 4" />

        {/* Floating event labels */}
        {floatingEvents.map((fe) => {
          const age = (Date.now() - fe.at) / 3500;
          const opacity = Math.max(0, 1 - age * 1.2);
          const dy = -age * 30;
          return (
            <g key={fe.id} transform={`translate(${fe.x}, ${fe.y + dy})`} opacity={opacity}>
              <rect x="-40" y="-12" width="80" height="22" rx="4" fill="rgba(0,0,0,0.75)" />
              <text x="0" y="5" textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace" fontWeight="bold">
                {fe.text.slice(0, 18)}
              </text>
            </g>
          );
        })}

        {/* Team labels */}
        <text x={PL + PW / 2} y={PT + PH + 14} textAnchor="middle" fontSize="10" fill="#22c55e" fontFamily="monospace" fontWeight="bold">
          {homeTeamName.slice(0, 20)} ▲
        </text>
        <text x={PL + PW / 2} y={PT - 6} textAnchor="middle" fontSize="10" fill="#60a5fa" fontFamily="monospace" fontWeight="bold">
          ▼ {awayTeamName.slice(0, 20)}
        </text>

        {/* Score box */}
        <g transform={`translate(${W / 2 - 60}, ${PT + PH / 2 - 16})`}>
          <rect x="0" y="0" width="120" height="32" rx="6" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.15)" />
          <text x="60" y="21" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold" fontFamily="monospace">
            {homeScore ?? 0} — {awayScore ?? 0}
          </text>
        </g>

        {/* Minute */}
        <g transform={`translate(${PL - 4}, ${PT + PH / 2 - 10})`}>
          <rect x="-2" y="0" width="36" height="20" rx="3" fill="rgba(0,0,0,0.6)" />
          <circle cx="8" cy="10" r="4" fill={minute > 0 && minute < 90 && animating ? "#ef4444" : "#666"} opacity="0.9">
            {animating && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
          </circle>
          <text x="15" y="14" fontSize="8" fill="white" fontFamily="monospace" fontWeight="bold">{minute}'</text>
        </g>
      </svg>

      {/* Goal events ticker */}
      {goalEvents.length > 0 && (
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end">
          {goalEvents.slice(-4).map((e, i) => (
            <div key={i} className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${e.teamId === homeTeamId ? "bg-green-500/80 text-black" : "bg-blue-500/80 text-white"}`}>
              ⚽ {e.playerName?.split(" ").slice(-1)[0] ?? "?"} {e.minute}'
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
