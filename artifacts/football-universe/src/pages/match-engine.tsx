import { useState, useRef } from "react";
import { Link } from "wouter";
import { useListMatches, useListLeagues, useSimulateMatch } from "@workspace/api-client-react";
import type { Match, MatchDetail } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pitch2D } from "@/components/match/pitch-2d";
import type { PitchEvent, FormationKey } from "@/components/match/pitch-2d";
import { FormationBoard } from "@/components/match/formation-board";
import {
  Play, Zap, Trophy, RefreshCw, ChevronRight,
  Activity, Target, Clock, BarChart2, Loader2,
} from "lucide-react";

interface SimResult {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  leagueName: string;
  events: PitchEvent[];
  simulatedAt: number;
}

const COMMENTARY_LINES = [
  "⚽ Trận đấu bắt đầu! Bóng lăn trên sân xanh!",
  "🎯 Pha tấn công nguy hiểm từ phía cánh phải!",
  "🛡️ Hàng thủ xử lý tốt tình huống căng thẳng!",
  "💨 Cú sprint tốc độ cao — thủ môn ra cản phá!",
  "🔥 Áp lực đang gia tăng — khán giả đang hò reo!",
  "⚡ Pha bóng nhanh qua 3 cầu thủ — tuyệt vời!",
  "🟨 Trọng tài rút thẻ vàng sau pha vào bóng mạnh!",
  "🎙️ Cả hai đội đang thi đấu với cường độ cao!",
  "🌟 Tiền đạo số 9 vào vùng nguy hiểm — sút!",
  "📊 Tỷ lệ kiểm soát bóng đang nghiêng về đội nhà!",
];

export default function MatchEngine() {
  const { data: rawMatches = [], isLoading: matchesLoading, refetch } = useListMatches({ status: "upcoming" });
  const { data: leagues = [] } = useListLeagues();

  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [formation, setFormation] = useState<FormationKey>("4-4-2");
  const [simResults, setSimResults] = useState<SimResult[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [liveMatch, setLiveMatch] = useState<{ match: Match; minute: number; events: PitchEvent[]; animating: boolean } | null>(null);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: simulate, isPending } = useSimulateMatch({
    mutation: {
      onSuccess: (result: MatchDetail) => {
        const events: PitchEvent[] = (result.events ?? []).map((e: any) => ({
          id: e.id, type: e.type, minute: e.minute,
          playerName: e.playerName, teamId: e.teamId, description: e.description,
        }));
        const simmed: SimResult = {
          matchId: result.id,
          homeTeamName: result.homeTeamName ?? "Đội Nhà",
          awayTeamName: result.awayTeamName ?? "Đội Khách",
          homeScore: result.homeScore ?? 0,
          awayScore: result.awayScore ?? 0,
          leagueName: result.leagueName ?? "",
          events,
          simulatedAt: Date.now(),
        };
        setSimResults(prev => [simmed, ...prev].slice(0, 20));
        // Animate the match
        if (intervalRef.current) clearInterval(intervalRef.current);
        const currentMatch = rawMatches.find((m: Match) => m.id === activeMatchId) ?? null;
        if (currentMatch) {
          setLiveMatch({ match: currentMatch, minute: 0, events: [], animating: true });
          let min = 0;
          const commentaryLines = [...COMMENTARY_LINES].sort(() => Math.random() - 0.5);
          let ci = 0;
          intervalRef.current = setInterval(() => {
            min = Math.min(min + 5, 90);
            const revealedEvents = events.filter(e => e.minute <= min);
            setLiveMatch(prev => prev ? { ...prev, minute: min, events: revealedEvents } : null);
            if (ci < commentaryLines.length) {
              const goalEvt = events.find(e => e.minute <= min && e.minute > min - 5 && e.type === "goal");
              const line = goalEvt
                ? `⚽ Phút ${goalEvt.minute}': ${goalEvt.playerName ?? "Cầu thủ"} GHI BÀN! ${simmed.homeScore}-${simmed.awayScore}`
                : commentaryLines[ci % commentaryLines.length];
              setCommentary(prev => [line, ...prev].slice(0, 8));
              ci++;
            }
            if (min >= 90) {
              clearInterval(intervalRef.current!);
              setLiveMatch(prev => prev ? { ...prev, animating: false, minute: 90, events } : null);
              setCommentary(prev => [
                `🏁 KẾT THÚC: ${simmed.homeTeamName} ${simmed.homeScore} — ${simmed.awayScore} ${simmed.awayTeamName}`,
                ...prev,
              ].slice(0, 8));
              refetch();
            }
          }, 250);
        }
      },
      onError: () => setActiveMatchId(null),
    },
  });

  const handleSimulate = (match: Match) => {
    setActiveMatchId(match.id);
    setCommentary(["🎙️ Còi khai cuộc vang lên — trận đấu bắt đầu!"]);
    simulate({ matchId: match.id });
  };

  const handleBatchSimulate = async (leagueMatches: Match[]) => {
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: leagueMatches.length });
    for (let i = 0; i < leagueMatches.length; i++) {
      await new Promise<void>((resolve) => {
        simulate({ matchId: leagueMatches[i].id });
        setTimeout(() => resolve(), 800);
      });
      setBatchProgress({ done: i + 1, total: leagueMatches.length });
    }
    setTimeout(() => { setBatchRunning(false); refetch(); }, 1000);
  };

  const upcomingMatches = (rawMatches as Match[]).filter((m: Match) =>
    selectedLeague === "all" || m.leagueName === selectedLeague
  );

  const leagueNames = [...new Set((rawMatches as Match[]).map((m: Match) => m.leagueName).filter(Boolean))];
  const totalGoals = simResults.reduce((s, r) => s + r.homeScore + r.awayScore, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h1 className="font-mono font-black text-xl uppercase tracking-wider">⚡ Match Engine</h1>
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Badge className="font-mono text-xs bg-primary/10 text-primary border-primary/30">Phase 3</Badge>
            <Badge className="font-mono text-xs bg-green-500/10 text-green-400 border-green-400/30">
              {upcomingMatches.length} trận chờ
            </Badge>
            {simResults.length > 0 && (
              <Badge className="font-mono text-xs bg-orange-500/10 text-orange-400 border-orange-400/30">
                ✅ {simResults.length} đã mô phỏng · {totalGoals} bàn thắng
              </Badge>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: "Chờ mô phỏng", value: upcomingMatches.length, color: "text-primary" },
            { icon: Trophy, label: "Đã mô phỏng", value: simResults.length, color: "text-green-400" },
            { icon: Target, label: "Tổng bàn thắng", value: totalGoals, color: "text-orange-400" },
            { icon: BarChart2, label: "Giải đấu", value: leagueNames.length, color: "text-blue-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border/20 bg-card/40 p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <div className={`font-mono font-black text-xl ${color}`}>{value}</div>
                <div className="text-[11px] text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-[1fr_360px] gap-6">
          {/* Left: Live pitch + match list */}
          <div className="space-y-4">
            {/* Live pitch or idle state */}
            <div className="rounded-2xl border border-border/30 bg-card/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {liveMatch?.animating && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  <span className="font-mono font-bold text-sm uppercase">
                    {liveMatch ? `${liveMatch.match.homeTeamName} vs ${liveMatch.match.awayTeamName}` : "SÂN 2D — TRỰC TIẾP"}
                  </span>
                </div>
                {liveMatch && (
                  <div className="flex gap-2">
                    <Badge className="font-mono text-xs bg-green-500/10 text-green-400 border-green-400/20">●HOME</Badge>
                    <Badge className="font-mono text-xs bg-blue-500/10 text-blue-400 border-blue-400/20">●AWAY</Badge>
                  </div>
                )}
              </div>

              {liveMatch ? (
                <Pitch2D
                  homeTeamName={liveMatch.match.homeTeamName ?? "Đội Nhà"}
                  awayTeamName={liveMatch.match.awayTeamName ?? "Đội Khách"}
                  homeTeamId={liveMatch.match.homeTeamId}
                  awayTeamId={liveMatch.match.awayTeamId}
                  homeScore={simResults[0]?.matchId === liveMatch.match.id
                    ? (liveMatch.minute >= 90 ? simResults[0].homeScore : liveMatch.events.filter(e => e.type === "goal" && e.teamId === liveMatch.match.homeTeamId).length)
                    : 0}
                  awayScore={simResults[0]?.matchId === liveMatch.match.id
                    ? (liveMatch.minute >= 90 ? simResults[0].awayScore : liveMatch.events.filter(e => e.type === "goal" && e.teamId === liveMatch.match.awayTeamId).length)
                    : 0}
                  minute={liveMatch.minute}
                  events={liveMatch.events}
                  formation={formation}
                  animating={liveMatch.animating}
                  className="h-64 md:h-80 px-4 pb-4"
                />
              ) : (
                <div className="h-64 md:h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground px-4 pb-4">
                  <Activity className="w-10 h-10 opacity-20" />
                  <p className="font-mono text-sm">Chọn một trận đấu để bắt đầu mô phỏng</p>
                  <p className="text-xs text-center">Sân 2D sẽ hiển thị 22 cầu thủ, bóng di chuyển và sự kiện trực tiếp</p>
                </div>
              )}

              {/* Commentary */}
              {commentary.length > 0 && (
                <div className="border-t border-border/20 px-4 py-3 space-y-1.5 max-h-36 overflow-y-auto bg-background/20">
                  {commentary.map((line, i) => (
                    <p key={i} className={`text-sm font-mono ${i === 0 ? "text-foreground font-semibold" : "text-muted-foreground text-xs"}`}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* League filter + matches */}
            <div className="rounded-2xl border border-border/20 bg-card/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <h2 className="font-mono font-bold text-sm uppercase">Trận Chờ Mô Phỏng</h2>
                <div className="flex gap-2">
                  {upcomingMatches.length > 0 && (
                    <Button size="sm" variant="outline"
                      disabled={batchRunning || isPending}
                      onClick={() => handleBatchSimulate(upcomingMatches.slice(0, 10))}
                      className="font-mono text-xs h-8">
                      {batchRunning
                        ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />{batchProgress.done}/{batchProgress.total}</>
                        : <><Zap className="w-3 h-3 mr-1" />Mô phỏng tất cả</>}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-8 w-8 p-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* League tabs */}
              <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
                <button onClick={() => setSelectedLeague("all")}
                  className={`text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap transition-all ${selectedLeague === "all" ? "bg-primary/20 border-primary/50 text-primary" : "border-border/20 text-muted-foreground hover:border-primary/30"}`}>
                  Tất cả ({(rawMatches as Match[]).length})
                </button>
                {leagueNames.slice(0, 8).map(lg => (
                  <button key={lg} onClick={() => setSelectedLeague(lg ?? "")}
                    className={`text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap transition-all ${selectedLeague === lg ? "bg-primary/20 border-primary/50 text-primary" : "border-border/20 text-muted-foreground hover:border-primary/30"}`}>
                    {lg} ({(rawMatches as Match[]).filter((m: Match) => m.leagueName === lg).length})
                  </button>
                ))}
              </div>

              <div className="divide-y divide-border/10 max-h-96 overflow-y-auto">
                {matchesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : upcomingMatches.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm font-mono">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Không có trận nào chờ mô phỏng
                  </div>
                ) : (
                  upcomingMatches.slice(0, 30).map((match: Match) => {
                    const isActive = activeMatchId === match.id;
                    return (
                      <div key={match.id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-card/60"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-muted-foreground font-mono mb-0.5">{match.leagueName}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-sm font-bold truncate max-w-[100px]">{match.homeTeamName}</span>
                            <span className="text-muted-foreground text-xs font-mono">vs</span>
                            <span className="text-blue-400 text-sm font-bold truncate max-w-[100px]">{match.awayTeamName}</span>
                          </div>
                        </div>
                        <Button size="sm"
                          disabled={isPending || batchRunning}
                          onClick={() => handleSimulate(match)}
                          className={`font-mono text-xs h-8 flex-shrink-0 ${isActive ? "bg-primary" : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"}`}>
                          {isActive && isPending
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><Play className="w-3 h-3 mr-1" />Sim</>}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Formation + Results feed */}
          <div className="space-y-4">
            <FormationBoard
              value={formation}
              onChange={setFormation}
              homeTeamName={liveMatch?.match.homeTeamName}
              awayTeamName={liveMatch?.match.awayTeamName}
            />

            {/* Results feed */}
            <div className="rounded-2xl border border-border/20 bg-card/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <h3 className="font-mono font-bold text-sm uppercase">Kết Quả Mới Nhất</h3>
                {simResults.length > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">{simResults.length} kết quả</span>
                )}
              </div>
              <div className="divide-y divide-border/10 max-h-80 overflow-y-auto">
                {simResults.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs font-mono">
                    Kết quả sẽ hiện ở đây sau khi mô phỏng
                  </div>
                ) : simResults.map((r) => {
                  const homeWin = r.homeScore > r.awayScore;
                  const draw = r.homeScore === r.awayScore;
                  return (
                    <div key={`${r.matchId}-${r.simulatedAt}`} className="px-4 py-3">
                      <div className="text-[9px] text-muted-foreground font-mono mb-1">{r.leagueName}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate max-w-[80px] ${homeWin ? "text-green-400" : draw ? "text-yellow-400" : "text-muted-foreground"}`}>
                          {r.homeTeamName.split(" ").slice(-1)[0]}
                        </span>
                        <div className={`font-mono font-black text-sm px-2 py-0.5 rounded ${homeWin ? "bg-green-500/20 text-green-400" : draw ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}`}>
                          {r.homeScore} — {r.awayScore}
                        </div>
                        <span className={`text-xs font-bold truncate max-w-[80px] ${!homeWin && !draw ? "text-blue-400" : "text-muted-foreground"}`}>
                          {r.awayTeamName.split(" ").slice(-1)[0]}
                        </span>
                      </div>
                      {r.events.filter(e => e.type === "goal").length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.events.filter(e => e.type === "goal").map((e, i) => (
                            <span key={i} className="text-[9px] font-mono text-muted-foreground">
                              ⚽{e.playerName?.split(" ").slice(-1)[0]} {e.minute}'
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/matches">
                <Button variant="outline" className="w-full font-mono text-xs h-9 border-border/30">
                  <Trophy className="w-3.5 h-3.5 mr-1.5" />Xem Tất Cả Trận
                </Button>
              </Link>
              <Link href="/leagues">
                <Button variant="outline" className="w-full font-mono text-xs h-9 border-border/30">
                  <BarChart2 className="w-3.5 h-3.5 mr-1.5" />Bảng Xếp Hạng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
