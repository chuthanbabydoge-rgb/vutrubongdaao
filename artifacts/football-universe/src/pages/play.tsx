import { useState } from "react";
import { useLocation } from "wouter";
import { useGetUserPlayerCard, useListMatches, usePlayMatch } from "@workspace/api-client-react";
import type { PlayMatchResult, Match } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Target, Trophy, Star, Clock, Shield, Settings, Swords, ChevronRight } from "lucide-react";
import { Pitch2D } from "@/components/match/pitch-2d";
import type { PitchEvent, FormationKey } from "@/components/match/pitch-2d";
import { FormationBoard } from "@/components/match/formation-board";

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const COMMENTARY_POOL = [
  "🎙️ Một trận đấu kịch tính đang chờ đón chúng ta!",
  "🎙️ Cả hai đội đang thi đấu quyết liệt trên sân!",
  "🎙️ Trọng tài thổi còi khai mạc — bóng lăn rồi!",
  "🎙️ Đây là một trong những trận đấu hay nhất hôm nay!",
  "🎙️ Khán giả trên khán đài đang rất phấn khích!",
  "🎙️ Cường độ trận đấu đang tăng dần theo từng phút!",
  "🎙️ Cả hai hàng thủ đang thi đấu rất chắc chắn!",
  "🎙️ Màn kèo cánh bên phải đang diễn ra rất hay!",
  "🎙️ Cú sút từ xa — thủ môn bay người cản phá!",
  "🎙️ Phút thêm giờ bắt đầu — mọi thứ vẫn có thể xảy ra!",
];

function generateCommentary(minutes: number, events: PitchEvent[]) {
  const lines: { minute: number; text: string; isEvent: boolean }[] = [];
  const checkpoints = [2, 8, 15, 22, 30, 38, 45, 50, 58, 65, 72, 80, 87, 90];
  checkpoints.forEach(m => {
    if (m <= minutes) {
      const event = events.find(e => Math.abs(e.minute - m) <= 3 && !lines.some(l => l.minute === e.minute));
      if (event) {
        const icon = event.type === "goal" ? "⚽" : event.type === "yellow_card" ? "🟨" : "🎯";
        lines.push({ minute: event.minute, text: `${icon} Phút ${event.minute}': ${event.description ?? event.type}!`, isEvent: true });
      } else {
        lines.push({ minute: m, text: COMMENTARY_POOL[Math.floor(Math.random() * COMMENTARY_POOL.length)], isEvent: false });
      }
    }
  });
  return lines;
}

function MatchResultModal({ result, onClose }: { result: PlayMatchResult; onClose: () => void }) {
  const p = result.userPerformance;
  const m = result.match;
  const xpPercent = (p.newXp % 1000) / 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{p.goals > 0 ? "🎊" : p.rating >= 7 ? "⭐" : "💪"}</div>
          <h2 className="text-2xl font-black text-white">
            {p.goals >= 2 ? "XUẤT SẮC!" : p.goals === 1 ? "TỐT LẮM!" : p.rating >= 7 ? "SAN BẰNG!" : "HOÀN THÀNH!"}
          </h2>
          {p.levelUp && (
            <div className="mt-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-1 text-yellow-300 font-bold text-sm inline-block animate-pulse">
              🎉 LÊN CẤP {p.newLevel}!
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-center">
          <div className="text-white/60 text-xs mb-2">{m.leagueName}</div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-right"><p className="text-white font-bold text-sm">{m.homeTeamName}</p></div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <span className="text-white font-black text-2xl">{m.homeScore ?? 0} - {m.awayScore ?? 0}</span>
            </div>
            <div className="flex-1 text-left"><p className="text-white font-bold text-sm">{m.awayTeamName}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-emerald-400">{p.goals}</div>
            <div className="text-white/50 text-xs">⚽ Bàn thắng</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-blue-400">{p.assists}</div>
            <div className="text-white/50 text-xs">🎯 Kiến tạo</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className={`text-2xl font-black ${p.rating >= 8 ? "text-yellow-400" : p.rating >= 7 ? "text-emerald-400" : "text-white"}`}>{p.rating}</div>
            <div className="text-white/50 text-xs">⭐ Điểm số</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <Badge variant="outline" className="border-white/20 text-white/60">{p.minutesPlayed}' thi đấu</Badge>
          {p.yellowCard && <Badge className="bg-yellow-600/30 border-yellow-500/40 text-yellow-300">🟨 Thẻ vàng</Badge>}
          <Badge className="bg-red-900/30 border-red-500/40 text-red-300">-{p.staminaUsed} thể lực</Badge>
        </div>

        {p.keyMoments.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-white/60 text-xs font-bold mb-2">CÁC KHOẢNH KHẮC NỔI BẬT</p>
            <div className="space-y-1.5">
              {p.keyMoments.map((moment: string, i: number) => (
                <p key={i} className="text-white/80 text-sm">{moment}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-emerald-400 font-bold">+{p.xpEarned} XP</span>
            <span className="text-white/60">Cấp {p.newLevel} · {p.newXp % 1000}/1000 XP</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold">Tiếp Tục</Button>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: playerCard, isLoading: cardLoading, refetch: refetchCard } = useGetUserPlayerCard();
  const { data: matchesRaw = [] } = useListMatches();
  const [playingMatchId, setPlayingMatchId] = useState<number | null>(null);
  const [playMinute, setPlayMinute] = useState(0);
  const [pitchEvents, setPitchEvents] = useState<PitchEvent[]>([]);
  const [showResult, setShowResult] = useState<PlayMatchResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [commentary, setCommentary] = useState<{ minute: number; text: string; isEvent: boolean }[]>([]);
  const [formation, setFormation] = useState<FormationKey>("4-4-2");
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [liveHomeScore, setLiveHomeScore] = useState(0);
  const [liveAwayScore, setLiveAwayScore] = useState(0);

  const { mutate: playMatch } = usePlayMatch({
    mutation: {
      onSuccess: (result: PlayMatchResult) => {
        setIsAnimating(true);
        const events: PitchEvent[] = (result.match.events ?? []).map((e: any) => ({
          id: e.id, type: e.type, minute: e.minute,
          playerName: e.playerName, teamId: e.teamId, description: e.description,
        }));
        const finalHomeScore = result.match.homeScore ?? 0;
        const finalAwayScore = result.match.awayScore ?? 0;
        let minute = 0;
        const interval = setInterval(() => {
          minute += 3;
          if (minute > 90) minute = 90;
          setPlayMinute(minute);
          const revealedEvents = events.filter(e => e.minute <= minute);
          setPitchEvents(revealedEvents);
          const currentMatch = matchesRaw.find((m: Match) => m.id === playingMatchId);
          if (currentMatch) {
            setLiveHomeScore(revealedEvents.filter(e => e.type === "goal" && e.teamId === currentMatch.homeTeamId).length);
            setLiveAwayScore(revealedEvents.filter(e => e.type === "goal" && e.teamId === currentMatch.awayTeamId).length);
          }
          setCommentary(generateCommentary(minute, revealedEvents));
          if (minute >= 90) {
            clearInterval(interval);
            setIsAnimating(false);
            setLiveHomeScore(finalHomeScore);
            setLiveAwayScore(finalAwayScore);
            setPitchEvents(events);
            setShowResult(result);
            refetchCard();
          }
        }, 220);
      },
      onError: (err: any) => {
        setPlayingMatchId(null);
        const msg = err?.response?.data?.error ?? err?.message ?? "Lỗi không xác định";
        toast({ title: "Không thể thi đấu", description: msg, variant: "destructive" });
      },
    },
  });

  const scheduledMatches = (matchesRaw as Match[]).filter((m: Match) => m.status === "scheduled" || m.status === "upcoming").slice(0, 10);
  const card = playerCard;
  const overall = card ? Math.round((card.pace + card.shooting + card.passing + card.dribbling + card.defending + card.physical) / 6) : 0;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Swords className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Đăng nhập để thi đấu!</p>
          <Button onClick={() => navigate("/login")}>Đăng Nhập</Button>
        </div>
      </div>
    );
  }

  if (!card && !cardLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-6xl">⚽</div>
          <h2 className="text-2xl font-black">Bạn Chưa Có Nhân Vật!</h2>
          <p className="text-muted-foreground">Hãy thiết lập vị trí và chỉ số trước khi thi đấu.</p>
          <Button onClick={() => navigate("/play/setup")} className="font-bold px-8">
            Tạo Nhân Vật Ngay <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  const posLabel = card?.position ?? "CM";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">⚽ SÂN CỎ ẢO</h1>
            <p className="text-emerald-400 text-sm mt-1">Tham gia trận đấu — xem trực tiếp trên sân 2D</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/play/setup")} className="border-white/20 text-white hover:bg-white/10">
            <Settings className="w-4 h-4 mr-1" /> Thiết Lập
          </Button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5">
          {/* Player Card (left) */}
          {card && (
            <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border border-emerald-500/30 rounded-2xl p-5">
              <div className="text-center mb-5">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-2 text-3xl shadow-lg">
                    {posLabel === "GK" ? "🧤" : ["CB","LB","RB"].includes(posLabel) ? "🛡️" : ["CM","CDM","CAM"].includes(posLabel) ? "🎯" : "⚽"}
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-black border-2 border-slate-900">
                    {overall}
                  </div>
                </div>
                <p className="text-white font-bold">{card.displayName ?? card.username}</p>
                <p className="text-emerald-400 text-sm">{posLabel}</p>
                {card.favoriteTeamName && <p className="text-white/40 text-xs">{card.favoriteTeamName}</p>}
              </div>

              {/* XP / Level */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-400 font-bold">Cấp {card.level}</span>
                  <span className="text-white/50">{card.xp % 1000}/1000 XP</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full" style={{ width: `${(card.xp % 1000) / 10}%` }} />
                </div>
              </div>

              {/* Stamina */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><Zap className="w-3 h-3" />Thể Lực</span>
                  <span className={`font-bold ${card.stamina < 30 ? "text-red-400" : card.stamina < 60 ? "text-yellow-400" : "text-emerald-400"}`}>{card.stamina}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${card.stamina < 30 ? "bg-red-500" : card.stamina < 60 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${card.stamina}%` }} />
                </div>
                {card.stamina < 30 && <p className="text-red-400 text-xs mt-1">⚠️ Thể lực quá thấp!</p>}
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                <StatBar label="⚡ Tốc Độ" value={card.pace} color="#10b981" />
                <StatBar label="🎯 Dứt Điểm" value={card.shooting} color="#f59e0b" />
                <StatBar label="🔄 Chuyền Bóng" value={card.passing} color="#3b82f6" />
                <StatBar label="🕺 Kỹ Thuật" value={card.dribbling} color="#8b5cf6" />
                <StatBar label="🛡️ Phòng Thủ" value={card.defending} color="#ef4444" />
                <StatBar label="💪 Thể Lực" value={card.physical} color="#f97316" />
              </div>

              {/* Career stats */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-xl font-black text-white">{card.matchesPlayed}</p><p className="text-white/40 text-xs">Trận</p></div>
                <div><p className="text-xl font-black text-emerald-400">{card.goals}</p><p className="text-white/40 text-xs">Bàn</p></div>
                <div><p className="text-xl font-black text-blue-400">{card.assists}</p><p className="text-white/40 text-xs">KT</p></div>
              </div>
            </div>
          )}

          {/* Center: 2D Pitch */}
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-emerald-500/30 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-2">
                  {isAnimating && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  <span className="text-white font-bold text-sm">
                    {activeMatch ? `${activeMatch.homeTeamName} vs ${activeMatch.awayTeamName}` : "SÂN 2D TRỰC TIẾP"}
                  </span>
                </div>
                {playingMatchId && (
                  <Badge className={`text-xs animate-pulse ${isAnimating ? "bg-red-600/40 border-red-500/50 text-red-300" : "bg-green-600/40 text-green-300"}`}>
                    {isAnimating ? `${playMinute}'` : "KT"}
                  </Badge>
                )}
              </div>

              <Pitch2D
                homeTeamName={activeMatch?.homeTeamName ?? "Đội Nhà"}
                awayTeamName={activeMatch?.awayTeamName ?? "Đội Khách"}
                homeTeamId={activeMatch?.homeTeamId}
                awayTeamId={activeMatch?.awayTeamId}
                homeScore={liveHomeScore}
                awayScore={liveAwayScore}
                minute={playMinute}
                events={pitchEvents}
                formation={formation}
                animating={isAnimating}
                highlightLabel={posLabel}
                className="h-64 md:h-72 px-3 pb-3"
              />

              {/* Commentary */}
              {commentary.length > 0 && (
                <div className="border-t border-white/10 px-4 py-3 space-y-1 max-h-28 overflow-y-auto bg-black/20">
                  {commentary.slice(-4).reverse().map((line, i) => (
                    <p key={i} className={`text-sm ${i === 0 ? (line.isEvent ? "text-yellow-300 font-bold" : "text-white") : "text-white/40 text-xs"}`}>
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Match list */}
            <div>
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Trận Sắp Diễn Ra
              </h2>
              {scheduledMatches.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/40">Không có trận nào khả dụng.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledMatches.map((match: Match) => (
                    <div key={match.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-[10px] mb-0.5">{match.leagueName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium text-sm truncate">{match.homeTeamName}</span>
                          <span className="text-white/30 text-xs">vs</span>
                          <span className="text-blue-400 font-medium text-sm truncate">{match.awayTeamName}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!card || card.stamina < 20 || playingMatchId !== null}
                        onClick={() => {
                          setPlayingMatchId(match.id);
                          setActiveMatch(match);
                          setPlayMinute(0);
                          setPitchEvents([]);
                          setLiveHomeScore(0);
                          setLiveAwayScore(0);
                          setCommentary([{ minute: 0, text: "🎙️ Còi khai cuộc vang lên — trận đấu bắt đầu!", isEvent: false }]);
                          playMatch({ matchId: match.id } as any);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold whitespace-nowrap h-8"
                      >
                        {playingMatchId === match.id ? "Đang chơi..." : "⚽ THAM GIA"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Formation */}
          <FormationBoard
            value={formation}
            onChange={setFormation}
            homeTeamName={activeMatch?.homeTeamName}
            awayTeamName={activeMatch?.awayTeamName}
          />
        </div>
      </div>

      {showResult && (
        <MatchResultModal
          result={showResult}
          onClose={() => {
            setShowResult(null);
            setPlayingMatchId(null);
            setActiveMatch(null);
          }}
        />
      )}
    </div>
  );
}
