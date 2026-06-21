import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { FormationKey } from "./pitch-2d";

interface FormationBoardProps {
  value: FormationKey;
  onChange: (f: FormationKey) => void;
  homeRating?: number;
  awayRating?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  className?: string;
}

const FORMATION_OPTIONS: { key: FormationKey; label: string; desc: string; style: string }[] = [
  { key: "4-4-2",   label: "4-4-2",   desc: "Cân bằng kinh điển",    style: "Phòng thủ tốt, tấn công hiệu quả" },
  { key: "4-3-3",   label: "4-3-3",   desc: "Tấn công mạnh mẽ",      style: "3 tiền đạo, tốc độ cao" },
  { key: "3-5-2",   label: "3-5-2",   desc: "Kiểm soát giữa sân",    style: "5 tiền vệ, chiếm lĩnh tâm trận" },
  { key: "4-2-3-1", label: "4-2-3-1", desc: "Hiện đại, linh hoạt",   style: "2 CDM bảo vệ hàng thủ" },
  { key: "5-3-2",   label: "5-3-2",   desc: "Phòng thủ kiên cố",     style: "5 hậu vệ, phản công nhanh" },
];

// Mini pitch positions (same as FORMATIONS in pitch-2d)
const MINI_POSITIONS: Record<FormationKey, { x: number; y: number; label: string }[]> = {
  "4-4-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 15, y: 76, label: "LB" }, { x: 37, y: 74, label: "CB" }, { x: 63, y: 74, label: "CB" }, { x: 85, y: 76, label: "RB" },
    { x: 12, y: 55, label: "LM" }, { x: 37, y: 51, label: "CM" }, { x: 63, y: 51, label: "CM" }, { x: 88, y: 55, label: "RM" },
    { x: 38, y: 31, label: "ST" }, { x: 62, y: 31, label: "ST" },
  ],
  "4-3-3": [
    { x: 50, y: 90, label: "GK" },
    { x: 15, y: 76, label: "LB" }, { x: 37, y: 74, label: "CB" }, { x: 63, y: 74, label: "CB" }, { x: 85, y: 76, label: "RB" },
    { x: 28, y: 51, label: "CM" }, { x: 50, y: 47, label: "CM" }, { x: 72, y: 51, label: "CM" },
    { x: 18, y: 26, label: "LW" }, { x: 50, y: 23, label: "ST" }, { x: 82, y: 26, label: "RW" },
  ],
  "3-5-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 25, y: 76, label: "CB" }, { x: 50, y: 74, label: "CB" }, { x: 75, y: 76, label: "CB" },
    { x: 10, y: 55, label: "LM" }, { x: 30, y: 50, label: "CM" }, { x: 50, y: 48, label: "CM" }, { x: 70, y: 50, label: "CM" }, { x: 90, y: 55, label: "RM" },
    { x: 37, y: 29, label: "ST" }, { x: 63, y: 29, label: "ST" },
  ],
  "4-2-3-1": [
    { x: 50, y: 90, label: "GK" },
    { x: 15, y: 76, label: "LB" }, { x: 37, y: 74, label: "CB" }, { x: 63, y: 74, label: "CB" }, { x: 85, y: 76, label: "RB" },
    { x: 35, y: 61, label: "CDM" }, { x: 65, y: 61, label: "CDM" },
    { x: 15, y: 45, label: "LW" }, { x: 50, y: 42, label: "CAM" }, { x: 85, y: 45, label: "RW" },
    { x: 50, y: 25, label: "ST" },
  ],
  "5-3-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 10, y: 76, label: "LWB" }, { x: 28, y: 74, label: "CB" }, { x: 50, y: 73, label: "CB" }, { x: 72, y: 74, label: "CB" }, { x: 90, y: 76, label: "RWB" },
    { x: 27, y: 50, label: "CM" }, { x: 50, y: 47, label: "CM" }, { x: 73, y: 50, label: "CM" },
    { x: 37, y: 28, label: "ST" }, { x: 63, y: 28, label: "ST" },
  ],
};

function MiniPitch({ formation }: { formation: FormationKey }) {
  const positions = MINI_POSITIONS[formation] ?? MINI_POSITIONS["4-4-2"];
  return (
    <svg viewBox="0 0 100 115" className="w-full h-full">
      <rect x="2" y="2" width="96" height="111" fill="#1a4a1a" rx="3" />
      {/* Stripes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={2 + i * 16} y="2" width="16" height="111" fill={i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent"} />
      ))}
      {/* Lines */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" fill="none">
        <rect x="2" y="2" width="96" height="111" />
        <line x1="2" y1="57.5" x2="98" y2="57.5" />
        <circle cx="50" cy="57.5" r="13" />
        <rect x="22" y="2" width="56" height="26" />
        <rect x="22" y="87" width="56" height="26" />
        <rect x="36" y="2" width="28" height="13" />
        <rect x="36" y="100" width="28" height="13" />
      </g>
      {/* Players */}
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5.5" fill="#22c55e" stroke="white" strokeWidth="0.8" />
          <text x={p.x} y={p.y + 0.6} textAnchor="middle" dominantBaseline="middle"
            fontSize="3.5" fill="white" fontWeight="bold" fontFamily="monospace">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function FormationBoard({
  value,
  onChange,
  homeRating,
  awayRating,
  homeTeamName = "Đội Nhà",
  awayTeamName = "Đội Khách",
  className = "",
}: FormationBoardProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedInfo = FORMATION_OPTIONS.find(f => f.key === value);

  const ratingDiff = homeRating && awayRating ? homeRating - awayRating : 0;
  const ratingColor = ratingDiff > 2 ? "text-green-400" : ratingDiff < -2 ? "text-red-400" : "text-yellow-400";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Team strengths */}
      {homeRating && awayRating && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-3">
          <div className="text-xs font-mono text-muted-foreground mb-2 text-center">SỨC MẠNH ĐỘI BÓNG</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-right">
              <div className="text-xs text-green-400 font-mono font-bold truncate">{homeTeamName.slice(0, 12)}</div>
              <div className="text-lg font-black text-green-400">{homeRating.toFixed(1)}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-xs font-mono font-bold ${ratingColor}`}>
                {ratingDiff > 0 ? `+${ratingDiff.toFixed(1)}` : ratingDiff.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">vs</div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs text-blue-400 font-mono font-bold truncate">{awayTeamName.slice(0, 12)}</div>
              <div className="text-lg font-black text-blue-400">{awayRating.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-2 h-2 bg-muted/20 rounded-full overflow-hidden flex">
            <div className="bg-green-500 transition-all" style={{ width: `${(homeRating / (homeRating + awayRating)) * 100}%` }} />
            <div className="bg-blue-500 flex-1" />
          </div>
        </div>
      )}

      {/* Formation selector */}
      <div className="rounded-xl border border-border/30 bg-card/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">SƠ ĐỒ CHIẾN THUẬT</span>
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] font-mono text-primary hover:underline">
            {expanded ? "Thu gọn ▲" : "Đổi sơ đồ ▼"}
          </button>
        </div>

        {/* Current formation mini-pitch */}
        <div className="flex items-start gap-3">
          <div className="w-20 h-24 flex-shrink-0">
            <MiniPitch formation={value} />
          </div>
          <div className="flex-1 pt-1">
            <div className="font-mono font-black text-2xl text-primary">{value}</div>
            <div className="text-xs font-bold text-foreground mt-0.5">{selectedInfo?.desc}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{selectedInfo?.style}</div>
          </div>
        </div>

        {/* Formation grid */}
        {expanded && (
          <div className="grid grid-cols-5 gap-1 pt-2 border-t border-border/20">
            {FORMATION_OPTIONS.map(f => (
              <button key={f.key} onClick={() => { onChange(f.key); setExpanded(false); }}
                className={`rounded-lg border p-1.5 text-center transition-all ${value === f.key ? "border-primary bg-primary/10" : "border-border/20 hover:border-primary/40"}`}>
                <div className="w-full aspect-[9/11] mb-1">
                  <MiniPitch formation={f.key} />
                </div>
                <div className="text-[9px] font-mono font-bold text-foreground">{f.key}</div>
                <div className="text-[8px] text-muted-foreground leading-tight">{f.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
