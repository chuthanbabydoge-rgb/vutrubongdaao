import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, X, Zap, Shield, Target, TrendingUp, Loader2, Users } from "lucide-react";
import { useListPlayers, useListMatches } from "@workspace/api-client-react";

interface ARStatsOverlayProps {
  onClose?: () => void;
}

export function ARStatsOverlay({ onClose }: ARStatsOverlayProps) {
  const { data: players, isLoading: playersLoading } = useListPlayers();
  const { data: matches, isLoading: matchesLoading } = useListMatches({ status: "live" });
  const { data: recentMatches } = useListMatches({ status: "finished" });

  const topPlayers = (players ?? []).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = topPlayers[selectedIdx];

  const liveMatch = (matches ?? [])[0] ?? (recentMatches ?? [])[0];

  const [scanLine, setScanLine] = useState(0);
  const [livePossession, setLivePossession] = useState(54);
  const [liveShots, setLiveShots] = useState(7);
  const [liveCorners, setLiveCorners] = useState(3);
  const [liveFouls, setLiveFouls] = useState(8);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setScanLine(p => (p + 1) % 100), 28);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setFrame(p => p + 1);
      setLivePossession(p => Math.min(78, Math.max(28, p + (Math.random() > 0.5 ? 1 : -1))));
      if (Math.random() > 0.88) setLiveShots(p => p + 1);
      if (Math.random() > 0.94) setLiveCorners(p => p + 1);
      if (Math.random() > 0.91) setLiveFouls(p => p + 1);
    }, 1800);
    return () => clearInterval(i);
  }, []);

  const StatBar = ({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) => (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  const isLoading = playersLoading || matchesLoading;

  return (
    <div className="relative w-full bg-black/90 rounded-2xl overflow-hidden border border-primary/30 font-mono" style={{ minHeight: 480 }}>
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.06) 2px, rgba(34,197,94,0.06) 4px)" }} />
      <div className="absolute left-0 right-0 h-px bg-primary/30 pointer-events-none transition-none"
        style={{ top: `${scanLine}%`, boxShadow: "0 0 10px rgba(34,197,94,0.5)" }} />

      {/* Header */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white/70 tracking-widest">AR LIVE OVERLAY</span>
          {!isLoading && <Badge className="text-[8px] bg-green-500/20 text-green-400 border-green-400/30 h-4 px-1">API</Badge>}
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 mt-8 gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-[11px] text-white/50 font-mono">Đang tải dữ liệu cầu thủ...</span>
        </div>
      ) : (
        <div className="pt-10 px-2 pb-2 space-y-2">
          {/* Player selector */}
          <div>
            <div className="text-[9px] text-white/40 mb-1 tracking-widest flex items-center gap-1">
              <Users className="w-2.5 h-2.5" /> CHỌN CẦU THỦ ({topPlayers.length} top rated)
            </div>
            <div className="flex gap-1 flex-wrap">
              {topPlayers.map((p, i) => (
                <button key={p.id} onClick={() => setSelectedIdx(i)}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all ${selectedIdx === i ? "bg-primary/30 border-primary/60 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"}`}>
                  {(p.position ?? "MF").slice(0, 2)} {(p.name ?? "").split(" ").slice(-1)[0].slice(0, 8)}
                </button>
              ))}
            </div>
          </div>

          {/* Player card */}
          {selected && (
            <div className="bg-black/60 border border-primary/20 rounded-xl p-3 backdrop-blur">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-white font-bold text-sm tracking-tight truncate max-w-[160px]">{selected.name}</div>
                  <div className="text-white/40 text-[10px]">{selected.position ?? "MF"} · {selected.nationality ?? "VN"}</div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-black text-primary leading-none">{selected.rating ?? 75}</div>
                  <div className="text-[9px] text-white/40">OVR</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <StatBar label="PAC" value={selected.pace ?? 70} />
                <StatBar label="SHO" value={selected.shooting ?? 70} color="bg-orange-400" />
                <StatBar label="PAS" value={selected.passing ?? 70} color="bg-blue-400" />
                <StatBar label="DEF" value={selected.defending ?? 50} color="bg-yellow-400" />
                <StatBar label="PHY" value={selected.physical ?? 70} color="bg-red-400" />
              </div>

              <div className="flex gap-3 mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-white font-bold">{selected.goals ?? 0}</span> bàn
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-white font-bold">{selected.assists ?? 0}</span> kiến tạo
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <Activity className="w-3 h-3 text-yellow-400" />
                  <span className="text-white font-bold">{selected.matchesPlayed ?? 0}</span> trận
                </div>
              </div>
            </div>
          )}

          {/* Live match stats */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 backdrop-blur">
            <div className="text-[9px] text-white/40 mb-2 tracking-widest flex items-center gap-1">
              <Activity className="w-2.5 h-2.5" />
              {liveMatch ? `TRẬN: ${liveMatch.homeTeamId ?? "HOME"} vs ${liveMatch.awayTeamId ?? "AWAY"}` : "THỐNG KÊ TRẬN LIVE"}
            </div>
            <div className="grid grid-cols-4 gap-1 text-center mb-2">
              {[
                { label: "Kiểm soát", value: `${livePossession}%`, icon: Shield },
                { label: "Sút", value: liveShots, icon: Target },
                { label: "Phạt góc", value: liveCorners, icon: Zap },
                { label: "Lỗi", value: liveFouls, icon: Activity },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 rounded-lg p-1.5">
                  <Icon className="w-3 h-3 text-primary mx-auto mb-0.5" />
                  <div className="text-white font-bold text-xs">{value}</div>
                  <div className="text-[8px] text-white/30">{label}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[9px] text-white/30 mb-1 text-center">KIỂM SOÁT BÓNG</div>
              <div className="flex rounded-full overflow-hidden h-3">
                <div className="bg-primary transition-all duration-1000 flex items-center justify-center" style={{ width: `${livePossession}%` }}>
                  <span className="text-[7px] font-bold text-black">{livePossession}%</span>
                </div>
                <div className="bg-blue-600 flex-1 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{100 - livePossession}%</span>
                </div>
              </div>
              <div className="flex justify-between text-[8px] text-white/30 mt-0.5">
                <span>HOME</span><span>AWAY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] text-white/20">
        <span>FRAME #{frame}</span>
        <span>API LIVE · {topPlayers.length} players loaded</span>
      </div>
    </div>
  );
}
