import { useState } from "react";
import { useLocation } from "wouter";
import { useSetupPlayerProfile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

type Position = "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST" | "CF";

const POSITION_INFO: Record<Position, { name: string; desc: string; color: string; x: number; y: number }> = {
  GK:  { name: "Thủ Môn",         desc: "Phòng thủ, phản xạ",     color: "#f59e0b", x: 50, y: 88 },
  CB:  { name: "Trung Vệ",        desc: "Chắc chắn, không chiến", color: "#3b82f6", x: 50, y: 72 },
  LB:  { name: "Hậu Vệ Trái",    desc: "Tốc độ, truy đuổi",      color: "#3b82f6", x: 22, y: 72 },
  RB:  { name: "Hậu Vệ Phải",    desc: "Tốc độ, truy đuổi",      color: "#3b82f6", x: 78, y: 72 },
  CDM: { name: "Tiền Vệ Phòng",  desc: "Cắt bóng, phân phối",   color: "#8b5cf6", x: 50, y: 58 },
  CM:  { name: "Tiền Vệ Trung",  desc: "Kỹ thuật, tổ chức",     color: "#8b5cf6", x: 35, y: 48 },
  CAM: { name: "Tiền Vệ Công",   desc: "Sáng tạo, kiến tạo",    color: "#8b5cf6", x: 65, y: 48 },
  LW:  { name: "Tiền Vệ Cánh Trái","desc": "Tốc độ, kỹ thuật",  color: "#10b981", x: 18, y: 36 },
  RW:  { name: "Tiền Vệ Cánh Phải","desc": "Tốc độ, kỹ thuật",  color: "#10b981", x: 82, y: 36 },
  CF:  { name: "Tiền Đạo Lót Nhót","desc": "Linh hoạt, dứt điểm",color: "#ef4444", x: 50, y: 28 },
  ST:  { name: "Tiền Đạo Trung",  desc: "Dứt điểm, không chiến", color: "#ef4444", x: 50, y: 18 },
};

const STATS = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;
const STAT_LABELS: Record<typeof STATS[number], string> = {
  pace: "⚡ Tốc Độ", shooting: "🎯 Dứt Điểm", passing: "🔄 Chuyền Bóng",
  dribbling: "🕺 Kỹ Thuật", defending: "🛡️ Phòng Thủ", physical: "💪 Thể Lực",
};
const TOTAL_BONUS = 20;

export default function PlaySetup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [bonusPoints, setBonusPoints] = useState<Record<string, number>>({ pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 });

  const { mutate: setup, isPending } = useSetupPlayerProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "✅ Nhân vật đã được tạo!", description: "Sẵn sàng thi đấu rồi! Vào sân nào!" });
        navigate("/play");
      },
      onError: (err: any) => {
        toast({ title: "Lỗi", description: err?.message ?? "Không thể thiết lập", variant: "destructive" });
      },
    },
  });

  const totalBonus = Object.values(bonusPoints).reduce((s, v) => s + v, 0);
  const remaining = TOTAL_BONUS - totalBonus;

  const addBonus = (stat: string, delta: number) => {
    setBonusPoints(prev => {
      const cur = prev[stat];
      const newVal = Math.max(0, Math.min(10, cur + delta));
      const newTotal = totalBonus - cur + newVal;
      if (newTotal > TOTAL_BONUS) return prev;
      return { ...prev, [stat]: newVal };
    });
  };

  const handleFinish = () => {
    if (!selectedPos) return;
    setup({ data: { position: selectedPos, ...Object.fromEntries(STATS.map(s => [s, bonusPoints[s]])) } as any });
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Bạn cần đăng nhập để thiết lập nhân vật.</p>
          <Button onClick={() => navigate("/login")}>Đăng Nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">⚽ TẠO NHÂN VẬT</h1>
          <p className="text-emerald-400 text-sm">Chào mừng, {user.displayName ?? user.username}! Hãy chọn vị trí thi đấu của bạn.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[{ n: 1, label: "Vị trí" }, { n: 2, label: "Chỉ số" }, { n: 3, label: "Xác nhận" }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > n ? "bg-emerald-500 text-white" :
                step === n ? "bg-emerald-600 text-white ring-2 ring-emerald-400" :
                "bg-white/10 text-white/40"
              }`}>
                {step > n ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm ${step >= n ? "text-white" : "text-white/40"}`}>{label}</span>
              {n < 3 && <div className="w-8 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Chọn vị trí */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white text-center mb-6">Bạn muốn chơi ở đâu?</h2>
            {/* Football Pitch */}
            <div className="relative mx-auto bg-emerald-800 rounded-xl overflow-hidden border border-emerald-600/40" style={{ width: "100%", maxWidth: 480, height: 380 }}>
              {/* Pitch markings */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/2 left-0 right-0 border-t border-white/50 -translate-y-1/2" />
                <div className="absolute inset-4 border border-white/30 rounded" />
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-4 left-1/4 right-1/4 border border-white/40 h-16 rounded-t" />
                <div className="absolute top-4 left-1/4 right-1/4 border border-white/40 h-16 rounded-b" />
              </div>

              {/* Position buttons */}
              {(Object.entries(POSITION_INFO) as [Position, typeof POSITION_INFO[Position]][]).map(([pos, info]) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPos(pos)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                    selectedPos === pos ? "scale-125 z-10" : "scale-100 hover:scale-110"
                  }`}
                  style={{ left: `${info.x}%`, top: `${info.y}%` }}
                >
                  <div className={`flex flex-col items-center gap-0.5`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all shadow-lg ${
                      selectedPos === pos
                        ? "border-white text-white shadow-white/30 shadow-lg"
                        : "border-white/30 text-white/80 hover:border-white/60"
                    }`} style={{ backgroundColor: selectedPos === pos ? info.color : `${info.color}66` }}>
                      {pos}
                    </div>
                    {selectedPos === pos && (
                      <span className="text-white text-[10px] font-bold bg-black/50 px-1 rounded whitespace-nowrap">{info.name}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected position info */}
            {selectedPos && (
              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{POSITION_INFO[selectedPos].name}</p>
                <p className="text-white/60 text-sm mt-1">{POSITION_INFO[selectedPos].desc}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button disabled={!selectedPos} onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-500">
                Tiếp Theo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Phân bổ điểm chỉ số */}
        {step === 2 && selectedPos && (
          <div>
            <h2 className="text-xl font-bold text-white text-center mb-2">Phân Bổ Điểm Chỉ Số</h2>
            <p className="text-white/50 text-center text-sm mb-6">
              Bạn còn <span className="text-emerald-400 font-bold">{remaining}</span> điểm để phân bổ (tổng {TOTAL_BONUS} điểm)
            </p>

            <div className="space-y-4">
              {STATS.map(stat => {
                const base = ({ GK: { pace:45, shooting:30, passing:50, dribbling:35, defending:72, physical:68 }, CB: { pace:50, shooting:40, passing:52, dribbling:42, defending:73, physical:68 }, LB: { pace:68, shooting:45, passing:62, dribbling:58, defending:65, physical:60 }, RB: { pace:68, shooting:45, passing:62, dribbling:58, defending:65, physical:60 }, CDM: { pace:55, shooting:48, passing:65, dribbling:55, defending:67, physical:62 }, CM: { pace:60, shooting:58, passing:70, dribbling:65, defending:52, physical:58 }, CAM: { pace:65, shooting:68, passing:72, dribbling:72, defending:40, physical:52 }, LW: { pace:75, shooting:68, passing:65, dribbling:75, defending:38, physical:55 }, RW: { pace:75, shooting:68, passing:65, dribbling:75, defending:38, physical:55 }, ST: { pace:72, shooting:78, passing:58, dribbling:68, defending:35, physical:65 }, CF: { pace:70, shooting:75, passing:62, dribbling:70, defending:38, physical:60 } } as any)[selectedPos]?.[stat] ?? 50;
                const bonus = bonusPoints[stat];
                const total = Math.min(99, base + bonus);
                return (
                  <div key={stat} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{STAT_LABELS[stat]}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => addBonus(stat, -1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition-colors" disabled={bonus === 0}>−</button>
                        <span className="text-emerald-400 font-bold w-8 text-center">{total}</span>
                        <button onClick={() => addBonus(stat, 1)} className="w-7 h-7 rounded-full bg-emerald-600/50 hover:bg-emerald-500/60 text-white text-lg flex items-center justify-center transition-colors" disabled={remaining === 0}>+</button>
                      </div>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20 rounded-full" style={{ width: `${base}%` }} />
                      <div className="absolute top-0 h-full bg-emerald-500 rounded-full transition-all" style={{ left: `${base}%`, width: `${bonus}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>Cơ bản: {base}</span>
                      {bonus > 0 && <span className="text-emerald-400">+{bonus} điểm thưởng</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/20 text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4 mr-1" /> Quay Lại
              </Button>
              <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-500">
                Xem Lại <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Xác nhận */}
        {step === 3 && selectedPos && (
          <div>
            <h2 className="text-xl font-bold text-white text-center mb-6">Xác Nhận Nhân Vật</h2>
            <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
                {selectedPos === "GK" ? "🧤" : selectedPos.includes("B") ? "🛡️" : ["CM","CDM","CAM"].includes(selectedPos) ? "🎯" : "⚽"}
              </div>
              <p className="text-white/60 text-sm mb-1">{user.displayName ?? user.username}</p>
              <p className="text-2xl font-black text-white mb-1">{POSITION_INFO[selectedPos].name}</p>
              <div className="inline-block bg-emerald-600/30 border border-emerald-500/40 rounded-lg px-4 py-1 text-emerald-300 font-bold">{selectedPos}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {STATS.map(stat => {
                const base = ({ GK: { pace:45, shooting:30, passing:50, dribbling:35, defending:72, physical:68 }, CB: { pace:50, shooting:40, passing:52, dribbling:42, defending:73, physical:68 }, LB: { pace:68, shooting:45, passing:62, dribbling:58, defending:65, physical:60 }, RB: { pace:68, shooting:45, passing:62, dribbling:58, defending:65, physical:60 }, CDM: { pace:55, shooting:48, passing:65, dribbling:55, defending:67, physical:62 }, CM: { pace:60, shooting:58, passing:70, dribbling:65, defending:52, physical:58 }, CAM: { pace:65, shooting:68, passing:72, dribbling:72, defending:40, physical:52 }, LW: { pace:75, shooting:68, passing:65, dribbling:75, defending:38, physical:55 }, RW: { pace:75, shooting:68, passing:65, dribbling:75, defending:38, physical:55 }, ST: { pace:72, shooting:78, passing:58, dribbling:68, defending:35, physical:65 }, CF: { pace:70, shooting:75, passing:62, dribbling:70, defending:38, physical:60 } } as any)[selectedPos]?.[stat] ?? 50;
                const total = Math.min(99, base + bonusPoints[stat]);
                const emoji = { pace:"⚡", shooting:"🎯", passing:"🔄", dribbling:"🕺", defending:"🛡️", physical:"💪" }[stat];
                return (
                  <div key={stat} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className={`text-xl font-black ${total >= 70 ? "text-emerald-400" : total >= 55 ? "text-yellow-400" : "text-white"}`}>{total}</div>
                    <div className="text-white/40 text-xs">{STAT_LABELS[stat].replace(/[^a-zA-Z ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g, "").trim()}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-3 text-center mb-6">
              <p className="text-yellow-300 text-sm">⚠️ Sau khi xác nhận, bạn có thể thay đổi lại bằng cách ghé trang Thiết Lập.</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="border-white/20 text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4 mr-1" /> Sửa Lại
              </Button>
              <Button onClick={handleFinish} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500 font-bold px-8">
                {isPending ? "Đang tạo..." : "✅ XÁC NHẬN VÀO SÂN!"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
