import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, X, Zap, Shield, Target, TrendingUp } from "lucide-react";

interface PlayerARCard {
  name: string;
  position: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
  goals: number;
  assists: number;
}

const DEMO_PLAYERS: PlayerARCard[] = [
  { name: "Nguyễn Văn Quyết", position: "CAM", rating: 85, pace: 78, shooting: 82, passing: 88, defending: 45, physical: 72, goals: 12, assists: 9 },
  { name: "Đặng Văn Lâm", position: "GK", rating: 80, pace: 52, shooting: 18, passing: 65, defending: 82, physical: 78, goals: 0, assists: 1 },
  { name: "Quế Ngọc Hải", position: "CB", rating: 79, pace: 68, shooting: 42, passing: 70, defending: 83, physical: 84, goals: 3, assists: 2 },
  { name: "Nguyễn Tiến Linh", position: "ST", rating: 83, pace: 84, shooting: 85, passing: 72, defending: 38, physical: 76, goals: 18, assists: 5 },
];

interface ARStatsOverlayProps {
  onClose?: () => void;
}

export function ARStatsOverlay({ onClose }: ARStatsOverlayProps) {
  const [selected, setSelected] = useState<PlayerARCard>(DEMO_PLAYERS[0]);
  const [scanLine, setScanLine] = useState(0);
  const [liveStats, setLiveStats] = useState({ possession: 54, shots: 7, corners: 3, fouls: 8 });

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        possession: Math.min(75, Math.max(30, prev.possession + (Math.random() > 0.5 ? 1 : -1))),
        shots: prev.shots + (Math.random() > 0.85 ? 1 : 0),
        corners: prev.corners + (Math.random() > 0.92 ? 1 : 0),
        fouls: prev.fouls + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const StatBar = ({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) => (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="relative w-full bg-black/90 rounded-2xl overflow-hidden border border-primary/30 font-mono" style={{ minHeight: "460px" }}>
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.05) 2px, rgba(34,197,94,0.05) 4px)`,
        }}
      />
      <div
        className="absolute left-0 right-0 h-0.5 bg-primary/40 pointer-events-none transition-none"
        style={{ top: `${scanLine}%`, boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
      />

      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white/70 tracking-widest">AR LIVE OVERLAY</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30 h-5">WebXR</Badge>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0 text-white/50 hover:text-white">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="absolute top-10 left-2 right-2">
        <div className="text-[9px] text-white/40 mb-1 tracking-widest">CHỌN CẦU THỦ</div>
        <div className="flex gap-1 flex-wrap">
          {DEMO_PLAYERS.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelected(p)}
              className={`text-[9px] px-2 py-1 rounded border transition-all ${selected.name === p.name ? "bg-primary/30 border-primary/60 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"}`}
            >
              {p.position} {p.name.split(" ").slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute top-28 left-2 right-2 space-y-3">
        <div className="bg-black/60 border border-primary/20 rounded-xl p-3 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-white font-bold text-sm tracking-tight">{selected.name}</div>
              <div className="text-white/40 text-[10px]">{selected.position} • Vũ Trụ Bóng Đá</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary leading-none">{selected.rating}</div>
              <div className="text-[9px] text-white/40">OVR</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <StatBar label="PAC" value={selected.pace} />
            <StatBar label="SHO" value={selected.shooting} color="bg-orange-400" />
            <StatBar label="PAS" value={selected.passing} color="bg-blue-400" />
            <StatBar label="DEF" value={selected.defending} color="bg-yellow-400" />
            <StatBar label="PHY" value={selected.physical} color="bg-red-400" />
          </div>

          <div className="flex gap-3 mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1 text-[10px] text-white/60">
              <Target className="w-3 h-3 text-primary" />
              <span className="text-white font-bold">{selected.goals}</span> bàn
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/60">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              <span className="text-white font-bold">{selected.assists}</span> kiến tạo
            </div>
          </div>
        </div>

        <div className="bg-black/60 border border-white/10 rounded-xl p-3 backdrop-blur">
          <div className="text-[9px] text-white/40 mb-2 tracking-widest flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> THỐNG KÊ TRẬN TRỰC TIẾP
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Kiểm soát", value: `${liveStats.possession}%`, icon: Shield },
              { label: "Sút", value: liveStats.shots, icon: Target },
              { label: "Phạt góc", value: liveStats.corners, icon: Zap },
              { label: "Lỗi", value: liveStats.fouls, icon: Activity },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/5 rounded-lg p-1.5">
                <Icon className="w-3 h-3 text-primary mx-auto mb-0.5" />
                <div className="text-white font-bold text-xs">{value}</div>
                <div className="text-[8px] text-white/30">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <div className="text-[9px] text-white/30 mb-1 text-center">KIỂM SOÁT BÓNG</div>
            <div className="flex rounded-full overflow-hidden h-3">
              <div
                className="bg-primary transition-all duration-1000 flex items-center justify-center"
                style={{ width: `${liveStats.possession}%` }}
              >
                <span className="text-[7px] font-bold text-black">{liveStats.possession}%</span>
              </div>
              <div className="bg-blue-600 flex-1 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">{100 - liveStats.possession}%</span>
              </div>
            </div>
            <div className="flex justify-between text-[8px] text-white/30 mt-0.5">
              <span>VN XI</span>
              <span>WORLD XI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-white/20">
        <span>AR FRAME: {Math.floor(Date.now() / 1000) % 9999}</span>
        <span>LAT: 21.02°N · LON: 105.85°E</span>
      </div>
    </div>
  );
}
