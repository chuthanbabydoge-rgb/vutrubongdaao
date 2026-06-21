import { useState } from "react";
import { useLocation } from "wouter";
import { useGetUserPlayerCard, useListMatches, usePlayMatch } from "@workspace/api-client-react";
import type { PlayMatchResult, Match } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Target, Trophy, Star, Clock, Shield, Settings } from "lucide-react";

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
];

function generateCommentary(minutes: number, events: {minute: number; type: string; description: string}[]) {
  const lines: { minute: number; text: string; isEvent: boolean }[] = [];
  const checkpoints = [2, 8, 15, 22, 30, 38, 45, 50, 58, 65, 72, 80, 87, 90];
  checkpoints.forEach(m => {
    if (m <= minutes) {
      const event = events.find(e => Math.abs(e.minute - m) <= 3 && !lines.some(l => l.minute === e.minute));
      if (event) {
        const icon = event.type === "goal" ? "⚽" : event.type === "yellow_card" ? "🟨" : "🎯";
        lines.push({ minute: event.minute, text: `${icon} Phút ${event.minute}': ${event.description}!`, isEvent: true });
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
        {/* Header */}
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

        {/* Score */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-center">
          <div className="text-white/60 text-xs mb-2">{m.leagueName}</div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-right">
              <p className="text-white font-bold text-sm">{m.homeTeamName}</p>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <span className="text-white font-black text-2xl">{m.homeScore ?? 0} - {m.awayScore ?? 0}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">{m.awayTeamName}</p>
            </div>
          </div>
        </div>

        {/* User stats */}
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

        {/* Extra info */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <Badge variant="outline" className="border-white/20 text-white/60">{p.minutesPlayed}' thi đấu</Badge>
          {p.yellowCard && <Badge className="bg-yellow-600/30 border-yellow-500/40 text-yellow-300">🟨 Thẻ vàng</Badge>}
          <Badge className="bg-red-900/30 border-red-500/40 text-red-300">-{p.staminaUsed} thể lực</Badge>
        </div>

        {/* Key moments */}
        {p.keyMoments.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-white/60 text-xs font-bold mb-2">CÁC KHOẢNH KHẮC NỔI BẬT</p>
            <div className="space-y-1.5">
              {p.keyMoments.map((moment, i) => (
                <p key={i} className="text-white/80 text-sm">{moment}</p>
              ))}
            </div>
          </div>
        )}

        {/* XP / Level */}
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-emerald-400 font-bold">+{p.xpEarned} XP</span>
            <span className="text-white/60">Cấp {p.newLevel} · {p.newXp % 1000}/1000 XP</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold">
          Tiếp Tục
        </Button>
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
  const [showResult, setShowResult] = useState<PlayMatchResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [commentary, setCommentary] = useState<{ minute: number; text: string; isEvent: boolean }[]>([]);

  const { mutate: playMatch } = usePlayMatch({
    mutation: {
      onSuccess: (result) => {
        // Start animation
        setIsAnimating(true);
        const events = result.match.events ?? [];
        let minute = 0;
        const interval = setInterval(() => {
          minute += 3;
          if (minute > 90) minute = 90;
          setPlayMinute(minute);
          setCommentary(generateCommentary(minute, events));
          if (minute >= 90) {
            clearInterval(interval);
            setIsAnimating(false);
            setShowResult(result);
            refetchCard();
          }
        }, 200);
      },
      onError: (err: any) => {
        setPlayingMatchId(null);
        const msg = err?.response?.data?.error ?? err?.message ?? "Lỗi không xác định";
        toast({ title: "Không thể thi đấu", description: msg, variant: "destructive" });
      },
    },
  });

  const scheduledMatches = matchesRaw.filter((m: Match) => m.status === "scheduled" || m.status === "upcoming").slice(0, 10);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Đăng nhập để thi đấu!</p>
          <Button onClick={() => navigate("/login")}>Đăng Nhập</Button>
        </div>
      </div>
    );
  }

  if (!playerCard && !cardLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-black text-white mb-2">Bạn Chưa Có Nhân Vật!</h2>
          <p className="text-white/50 mb-6">Hãy thiết lập vị trí và chỉ số trước khi thi đấu.</p>
          <Button onClick={() => navigate("/play/setup")} className="bg-emerald-600 hover:bg-emerald-500 font-bold px-8">
            Tạo Nhân Vật Ngay
          </Button>
        </div>
      </div>
    );
  }

  const card = playerCard!;
  const overall = card ? Math.round((card.pace + card.shooting + card.passing + card.dribbling + card.defending + card.physical) / 6) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">⚽ SÂN CỎ ẢO</h1>
            <p className="text-emerald-400 text-sm mt-1">Tham gia trận đấu và viết lên sự nghiệp của bạn</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/play/setup")} className="border-white/20 text-white hover:bg-white/10">
            <Settings className="w-4 h-4 mr-1" /> Thiết Lập Lại
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border border-emerald-500/30 rounded-2xl p-6">
              <div className="text-center mb-6">
                {/* Overall badge */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-3 text-4xl shadow-lg shadow-emerald-900/50">
                    {(card.position ?? "CM") === "GK" ? "🧤" : ["CB","LB","RB"].includes(card.position ?? "") ? "🛡️" : ["CM","CDM","CAM"].includes(card.position ?? "") ? "🎯" : "⚽"}
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-black border-2 border-slate-900">
                    {overall}
                  </div>
                </div>
                <p className="text-white font-bold text-lg">{card.displayName ?? card.username}</p>
                <p className="text-emerald-400 text-sm">{card.position ?? "—"}</p>
                {card.favoriteTeamName && <p className="text-white/40 text-xs mt-0.5">{card.favoriteTeamName}</p>}
              </div>

              {/* Level / XP */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-400 font-bold">Cấp {card.level}</span>
                  <span className="text-white/50">{card.xp % 1000}/1000 XP</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full" style={{ width: `${(card.xp % 1000) / 10}%` }} />
                </div>
              </div>

              {/* Stamina */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><Zap className="w-3 h-3" />Thể Lực</span>
                  <span className={`font-bold ${card.stamina < 30 ? "text-red-400" : card.stamina < 60 ? "text-yellow-400" : "text-emerald-400"}`}>{card.stamina}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${card.stamina < 30 ? "bg-red-500" : card.stamina < 60 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${card.stamina}%` }} />
                </div>
                {card.stamina < 30 && <p className="text-red-400 text-xs mt-1">⚠️ Thể lực quá thấp để thi đấu!</p>}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <StatBar label="⚡ Tốc Độ" value={card.pace} color="#10b981" />
                <StatBar label="🎯 Dứt Điểm" value={card.shooting} color="#f59e0b" />
                <StatBar label="🔄 Chuyền Bóng" value={card.passing} color="#3b82f6" />
                <StatBar label="🕺 Kỹ Thuật" value={card.dribbling} color="#8b5cf6" />
                <StatBar label="🛡️ Phòng Thủ" value={card.defending} color="#ef4444" />
                <StatBar label="💪 Thể Lực" value={card.physical} color="#f97316" />
              </div>

              {/* Career stats */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-black text-white">{card.matchesPlayed}</p>
                  <p className="text-white/40 text-xs">Trận</p>
                </div>
                <div>
                  <p className="text-xl font-black text-emerald-400">{card.goals}</p>
                  <p className="text-white/40 text-xs">Bàn</p>
                </div>
                <div>
                  <p className="text-xl font-black text-blue-400">{card.assists}</p>
                  <p className="text-white/40 text-xs">Kiến Tạo</p>
                </div>
              </div>
              {card.matchesPlayed > 0 && (
                <div className="mt-2 text-center">
                  <p className="text-white/60 text-xs">Đánh giá TB: <span className="text-yellow-400 font-bold">{Number(card.rating).toFixed(1)}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Match list + live play */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match animation area */}
            {playingMatchId && (
              <div className="bg-slate-800/60 border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm">🔴 ĐANG THI ĐẤU</p>
                  <Badge className="bg-red-600/40 border-red-500/50 text-red-300 text-xs animate-pulse">LIVE</Badge>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/60 text-xs">{playMinute}'</span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-200" style={{ width: `${(playMinute / 90) * 100}%` }} />
                  </div>
                  <span className="text-white/60 text-xs">90'</span>
                </div>
                {/* Animated pitch */}
                <div className="relative h-32 bg-emerald-800/60 rounded-xl overflow-hidden mb-3">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-0 right-0 border-t border-white/50 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  {/* Ball animation */}
                  <div className="absolute text-2xl transition-all duration-700 ease-in-out"
                    style={{
                      left: `${20 + Math.sin(playMinute / 8) * 30 + 20}%`,
                      top: `${30 + Math.cos(playMinute / 6) * 25}%`,
                    }}>
                    ⚽
                  </div>
                  <div className="absolute bottom-2 right-3 text-white/40 text-xs">{isAnimating ? "Đang thi đấu..." : "Kết thúc"}</div>
                </div>
                {/* Commentary */}
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {commentary.slice(-4).reverse().map((line, i) => (
                    <p key={i} className={`text-sm ${i === 0 ? (line.isEvent ? "text-yellow-300 font-bold" : "text-white") : "text-white/40"}`}>
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Available matches */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" /> Trận Sắp Diễn Ra
              </h2>
              {scheduledMatches.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/40">Hiện không có trận nào khả dụng.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledMatches.map((match: Match) => (
                    <div key={match.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs mb-1">{match.leagueName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm truncate">{match.homeTeamName}</span>
                          <span className="text-white/30 text-xs">vs</span>
                          <span className="text-white font-medium text-sm truncate">{match.awayTeamName}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={card.stamina < 20 || playingMatchId !== null}
                        onClick={() => {
                          setPlayingMatchId(match.id);
                          setPlayMinute(0);
                          setCommentary([{ minute: 0, text: "🎙️ Còi khai cuộc vang lên — trận đấu bắt đầu!", isEvent: false }]);
                          playMatch({ matchId: match.id } as any);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold whitespace-nowrap"
                      >
                        {playingMatchId === match.id ? "Đang chơi..." : "⚽ THAM GIA"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-white/3 border border-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs font-bold mb-2">💡 MẸO THI ĐẤU</p>
              <ul className="text-white/30 text-xs space-y-1">
                <li>• Chơi nhiều trận để tích lũy XP và lên cấp.</li>
                <li>• Mỗi trận tiêu tốn 20–35% thể lực. Nghỉ ngơi khi thể lực thấp.</li>
                <li>• Tiền đạo ghi nhiều bàn hơn, tiền vệ kiến tạo nhiều hơn.</li>
                <li>• Điểm đánh giá cao = nhiều XP hơn sau mỗi trận!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Result modal */}
      {showResult && (
        <MatchResultModal
          result={showResult}
          onClose={() => {
            setShowResult(null);
            setPlayingMatchId(null);
          }}
        />
      )}
    </div>
  );
}
