import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useGetMatch, useSimulateMatch, getGetMatchQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Timer, Trophy, MapPin, Calendar, Zap, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface SimEvent {
  id: number;
  type: string;
  minute: number;
  playerId?: number | null;
  playerName?: string | null;
  teamId: number;
  description?: string | null;
}

const EVENT_ICON: Record<string, string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  assist: "🎯",
};

const EVENT_LABEL_VI: Record<string, string> = {
  goal: "Bàn Thắng",
  yellow_card: "Thẻ Vàng",
  red_card: "Thẻ Đỏ",
  assist: "Kiến Tạo",
};

function TeamCircle({ name }: { name: string }) {
  const abbr = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 3).join("").toUpperCase();
  return (
    <div className="w-20 h-20 rounded-full flex items-center justify-center text-sm font-black font-mono border-4 border-primary/30 bg-primary/10 text-primary flex-shrink-0">
      {abbr}
    </div>
  );
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id ?? "0");
  const queryClient = useQueryClient();

  const { data: match, isLoading } = useGetMatch(matchId, {
    query: { enabled: !isNaN(matchId) && matchId > 0 },
  });

  const simulateMutation = useSimulateMatch();

  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [displayMinute, setDisplayMinute] = useState(0);
  const [liveHomeScore, setLiveHomeScore] = useState(0);
  const [liveAwayScore, setLiveAwayScore] = useState(0);
  const [allEvents, setAllEvents] = useState<SimEvent[]>([]);
  const [simHomeScore, setSimHomeScore] = useState(0);
  const [simAwayScore, setSimAwayScore] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSimulate = () => {
    if (simulating) return;
    setSimulating(true);
    setSimDone(false);
    setRevealedCount(0);
    setDisplayMinute(0);
    setLiveHomeScore(0);
    setLiveAwayScore(0);
    setAllEvents([]);

    simulateMutation.mutate(
      { matchId },
      {
        onSuccess: (result) => {
          const events = (result.events ?? []) as SimEvent[];
          const sorted = [...events].sort((a, b) => a.minute - b.minute);
          setAllEvents(sorted);
          setSimHomeScore(result.homeScore ?? 0);
          setSimAwayScore(result.awayScore ?? 0);

          if (sorted.length === 0) {
            setDisplayMinute(90);
            setLiveHomeScore(result.homeScore ?? 0);
            setLiveAwayScore(result.awayScore ?? 0);
            setRevealedCount(0);
            setSimDone(true);
            setSimulating(false);
            queryClient.invalidateQueries({ queryKey: getGetMatchQueryKey(matchId) });
            return;
          }

          let idx = 0;
          let currentHome = 0;
          let currentAway = 0;

          intervalRef.current = setInterval(() => {
            if (idx >= sorted.length) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setDisplayMinute(90);
              setLiveHomeScore(result.homeScore ?? 0);
              setLiveAwayScore(result.awayScore ?? 0);
              setRevealedCount(sorted.length);
              setSimDone(true);
              setSimulating(false);
              queryClient.invalidateQueries({ queryKey: getGetMatchQueryKey(matchId) });
              return;
            }
            const ev = sorted[idx];
            setDisplayMinute(ev.minute);
            setRevealedCount(idx + 1);
            if (ev.type === "goal") {
              const isHome = ev.teamId === result.homeTeamId;
              if (isHome) { currentHome++; setLiveHomeScore(currentHome); }
              else { currentAway++; setLiveAwayScore(currentAway); }
            }
            idx++;
          }, 500);
        },
        onError: () => {
          setSimulating(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container py-12 space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container py-12 text-center text-muted-foreground font-mono">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Không tìm thấy trận đấu.</p>
      </div>
    );
  }

  const isUpcoming = match.status === "upcoming" || match.status === "scheduled";
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const staticEvents = ((match.events ?? []) as SimEvent[]).sort((a, b) => a.minute - b.minute);
  const displayedEvents = simulating || simDone ? allEvents.slice(0, revealedCount) : staticEvents;

  const homeGoals = displayedEvents.filter((e) => e.type === "goal" && e.teamId === match.homeTeamId);
  const awayGoals = displayedEvents.filter((e) => e.type === "goal" && e.teamId === match.awayTeamId);

  const currentHomeScore = simulating ? liveHomeScore : simDone ? simHomeScore : (match.homeScore ?? 0);
  const currentAwayScore = simulating ? liveAwayScore : simDone ? simAwayScore : (match.awayScore ?? 0);
  const showScore = isFinished || simulating || simDone;

  return (
    <div className="container py-12 max-w-4xl space-y-8">
      <Link href="/matches">
        <Button variant="ghost" className="font-mono text-sm uppercase -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tất Cả Trận Đấu
        </Button>
      </Link>

      {/* Match Header Card */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        {/* League + Status Bar */}
        <div className="px-6 py-3 bg-card/60 border-b border-border/30 flex items-center justify-between">
          <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
            {match.leagueName}
          </span>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                TRỰC TIẾP {match.minute}'
              </span>
            )}
            {isFinished && !simulating && !simDone && (
              <Badge variant="secondary" className="font-mono bg-muted/50 text-muted-foreground">KẾT THÚC</Badge>
            )}
            {isUpcoming && !simulating && !simDone && (
              <Badge variant="outline" className="font-mono text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {match.scheduledAt ? format(new Date(match.scheduledAt), "dd/MM HH:mm") : "Sắp diễn ra"}
              </Badge>
            )}
            {simulating && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-bold animate-pulse">
                <Timer className="w-3 h-3" />
                {displayMinute}'
              </span>
            )}
            {simDone && (
              <Badge className="font-mono bg-green-500/10 text-green-400 border-green-500/30">KẾT THÚC</Badge>
            )}
          </div>
        </div>

        {/* Teams + Score */}
        <div className="p-8">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              {match.homeTeamLogoUrl ? (
                <div className="w-20 h-20 rounded-full bg-card/50 border-2 border-border/30 flex items-center justify-center overflow-hidden">
                  <img src={match.homeTeamLogoUrl} alt={match.homeTeamName} className="w-14 h-14 object-contain" />
                </div>
              ) : (
                <TeamCircle name={match.homeTeamName} />
              )}
              <div className="text-center">
                <div className="font-black font-mono text-lg tracking-tight">{match.homeTeamName}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1 min-h-4">
                  {homeGoals.map((g) => `${g.playerName?.split(" ").pop()} ${g.minute}'`).join("  ")}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2 px-4 min-w-[120px]">
              {showScore ? (
                <div className="text-6xl md:text-7xl font-black font-mono tracking-tighter tabular-nums flex items-center gap-1">
                  <span>{currentHomeScore}</span>
                  <span className="text-muted-foreground/40 mx-1 text-5xl">—</span>
                  <span>{currentAwayScore}</span>
                </div>
              ) : (
                <div className="text-5xl font-black font-mono text-muted-foreground/40 tracking-tighter">vs</div>
              )}
              {isUpcoming && !simulating && !simDone && match.venue && (
                <div className="text-xs text-muted-foreground font-mono text-center flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[120px]">{match.venue}</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              {match.awayTeamLogoUrl ? (
                <div className="w-20 h-20 rounded-full bg-card/50 border-2 border-border/30 flex items-center justify-center overflow-hidden">
                  <img src={match.awayTeamLogoUrl} alt={match.awayTeamName} className="w-14 h-14 object-contain" />
                </div>
              ) : (
                <TeamCircle name={match.awayTeamName} />
              )}
              <div className="text-center">
                <div className="font-black font-mono text-lg tracking-tight">{match.awayTeamName}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1 min-h-4">
                  {awayGoals.map((g) => `${g.playerName?.split(" ").pop()} ${g.minute}'`).join("  ")}
                </div>
              </div>
            </div>
          </div>

          {/* Simulate Button */}
          {isUpcoming && !simulating && !simDone && (
            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground font-mono">Trận đấu chưa bắt đầu. Nhấn để chạy mô phỏng!</p>
              <Button
                size="lg"
                className="h-14 px-10 font-mono font-bold text-lg uppercase tracking-wider bg-primary hover:bg-primary/90 shadow-[0_0_24px_-6px] shadow-primary/60"
                onClick={handleSimulate}
                disabled={simulateMutation.isPending}
              >
                <Play className="w-5 h-5 mr-3" />
                ⚽ Mô Phỏng Trận Đấu
              </Button>
            </div>
          )}

          {/* Simulating Progress Bar */}
          {simulating && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>0'</span>
                <span className="text-primary animate-pulse font-bold">{displayMinute}'</span>
                <span>90'</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(displayMinute / 90) * 100}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground font-mono animate-pulse">Đang mô phỏng trận đấu…</p>
            </div>
          )}

          {simDone && (
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 text-sm font-mono text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                <Trophy className="w-4 h-4" /> Mô phỏng hoàn tất!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Events Timeline */}
      {displayedEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" /> Diễn Biến Trận Đấu
          </h2>

          <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/20">
            {displayedEvents.map((event, idx) => {
              const isHomeTeam = event.teamId === match.homeTeamId;
              const icon = EVENT_ICON[event.type] ?? "•";
              const label = EVENT_LABEL_VI[event.type] ?? event.type;
              const isNewest = simulating && idx === revealedCount - 1;

              return (
                <div
                  key={`${event.id ?? idx}-${idx}`}
                  className={`flex items-center gap-4 px-5 py-3 transition-all duration-300 ${isNewest ? "bg-primary/10" : "bg-card/20 hover:bg-card/40"}`}
                >
                  <div className="w-10 text-center flex-shrink-0">
                    <span className="text-sm font-black font-mono text-primary">{event.minute}'</span>
                  </div>

                  {isHomeTeam ? (
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <div className="font-bold font-mono text-sm">{event.playerName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{label} · {match.homeTeamName}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <div className="w-4 flex justify-center">
                    <div className={`w-2 h-2 rounded-full ${event.type === "goal" ? "bg-primary" : event.type === "yellow_card" ? "bg-yellow-400" : "bg-red-400"}`} />
                  </div>

                  {!isHomeTeam ? (
                    <div className="flex-1 flex items-center gap-3 justify-end text-right">
                      <div>
                        <div className="font-bold font-mono text-sm">{event.playerName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{label} · {match.awayTeamName}</div>
                      </div>
                      <span className="text-lg">{icon}</span>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post-match Stats */}
      {(isFinished || simDone) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border/40 bg-card/30 space-y-3">
            <h3 className="font-black font-mono uppercase text-sm text-muted-foreground tracking-wider">Thống Kê</h3>
            <div className="space-y-3 text-sm font-mono">
              {[
                { label: "Bàn Thắng", home: homeGoals.length, away: awayGoals.length },
                {
                  label: "Thẻ Vàng",
                  home: displayedEvents.filter((e) => e.type === "yellow_card" && e.teamId === match.homeTeamId).length,
                  away: displayedEvents.filter((e) => e.type === "yellow_card" && e.teamId === match.awayTeamId).length,
                },
              ].map(({ label, home, away }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-black text-base">{home}</span>
                  <span className="text-muted-foreground uppercase text-xs tracking-wider">{label}</span>
                  <span className="font-black text-base">{away}</span>
                </div>
              ))}
            </div>
          </div>

          {(match.venue || match.scheduledAt) && (
            <div className="p-6 rounded-xl border border-border/40 bg-card/30 space-y-3">
              <h3 className="font-black font-mono uppercase text-sm text-muted-foreground tracking-wider">Thông Tin</h3>
              <div className="space-y-2 text-sm font-mono text-muted-foreground">
                {match.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" /><span>{match.venue}</span>
                  </div>
                )}
                {match.scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(match.scheduledAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
