import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XRDeviceChecker } from "@/components/vr/xr-device-checker";
import {
  Rocket, Cpu, Glasses, Waves, Globe, Lock, ArrowRight, Radio,
  Trophy, Activity, Play, ChevronRight, Zap,
} from "lucide-react";

const PHASES = [
  {
    phase: "Giai Đoạn 1",
    label: "Vũ Trụ 2D",
    status: "active",
    description: "Nền tảng web đầy đủ với dữ liệu trận đấu, 19+ giải đấu toàn cầu và quản lý đội bóng.",
    features: ["19+ Giải Đấu Toàn Cầu", "Kết Quả Trực Tiếp", "309+ Đội Bóng", "Bảng Xếp Hạng Giải Đấu"],
    icon: Globe,
    progress: 100,
  },
  {
    phase: "Giai Đoạn 2",
    label: "Dữ Liệu & Đội Bóng",
    status: "active",
    description: "Hệ thống đội bóng và giải đấu đầy đủ với 2431+ cầu thủ và 1462+ trận đấu.",
    features: ["2431+ Cầu Thủ", "1462+ Trận Đấu", "221 Bảng Xếp Hạng", "Thống Kê Chi Tiết"],
    icon: Activity,
    progress: 100,
  },
  {
    phase: "Giai Đoạn 3",
    label: "Mô Phỏng Trận Đấu",
    status: "upcoming",
    description: "Engine mô phỏng 2D, hệ thống sự kiện trận đấu, bình luận tự động và gameplay.",
    features: ["Engine Mô Phỏng", "Events Trận Đấu", "Bình Luận Tự Động", "Mini-game Gameplay"],
    icon: Cpu,
    progress: 0,
  },
  {
    phase: "Giai Đoạn 4",
    label: "VR/AR/XR",
    status: "building",
    description: "Sân bóng 3D với Three.js, WebXR, AR overlay thống kê và hỗ trợ kính VR đầy đủ.",
    features: ["3D Stadium Three.js", "WebXR Immersive VR", "AR Stats Overlay", "Spatial Audio"],
    icon: Glasses,
    progress: 35,
    href: "/vr-stadium",
  },
];

const statusConfig = {
  active:    { label: "✅ HOÀN THÀNH",    class: "bg-green-500/10 text-green-400 border-green-500/30" },
  building:  { label: "🔨 ĐANG BUILD",    class: "bg-primary/10 text-primary border-primary/30" },
  upcoming:  { label: "⏳ CHỜ",           class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  planned:   { label: "📋 DỰ KIẾN",       class: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

export default function VRGateway() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden py-24 border-b border-border/20">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
        <div className="container relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm">
            <Radio className="w-4 h-4 animate-pulse" />
            CỔNG VR/AR/XR — PHASE 4 ĐANG BUILD
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-mono tracking-tighter uppercase leading-[0.9]">
            Bước Vào <span className="text-primary block">Sân Cỏ Vũ Trụ</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Từ web đến VR đến AR — trải nghiệm mô phỏng bóng đá qua mọi chiều không gian thực tế.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vr-stadium">
              <Button size="lg" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                <Glasses className="w-5 h-5 mr-2" /> Vào Sân 3D + WebXR
              </Button>
            </Link>
            {!user ? (
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  <Rocket className="w-5 h-5 mr-2" /> Đăng Ký Ngay
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  <ArrowRight className="w-5 h-5 mr-2" /> Dashboard
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center text-xs font-mono text-muted-foreground">
            {["Three.js 3D", "WebXR API", "AR Overlay", "Meta Quest", "Apple Vision Pro", "Android AR"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full border border-border/30 bg-card/20">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-20 space-y-16">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black font-mono uppercase tracking-tighter">
              Lộ Trình <span className="text-primary">Đắm Chìm</span>
            </h2>
            <p className="text-muted-foreground font-mono">Bốn giai đoạn mở rộng thực tế — auto-tick khi agent build xong</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              const cfg = statusConfig[phase.status as keyof typeof statusConfig];
              const isLocked = phase.status === "planned";
              const isBuilding = phase.status === "building";
              const isDone = phase.status === "active";

              return (
                <div
                  key={idx}
                  className={`relative p-8 rounded-2xl border transition-all space-y-6
                    ${isDone ? "border-green-500/20 bg-green-500/5" : ""}
                    ${isBuilding ? "border-primary/40 bg-card/40 shadow-[0_0_30px_-10px] shadow-primary/20" : ""}
                    ${isLocked ? "border-border/30 bg-card/20 opacity-60" : ""}
                    ${phase.status === "upcoming" ? "border-border/30 bg-card/30" : ""}
                  `}
                >
                  {isLocked && <Lock className="absolute top-4 right-4 w-4 h-4 text-muted-foreground" />}
                  {isBuilding && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-mono text-primary">LIVE</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isDone ? "bg-green-500/10 border border-green-500/20" : ""}
                      ${isBuilding ? "bg-primary/10 border border-primary/30" : ""}
                      ${!isDone && !isBuilding ? "bg-muted/20" : ""}
                    `}>
                      <Icon className={`w-7 h-7 ${isDone ? "text-green-400" : isBuilding ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{phase.phase}</span>
                        <Badge className={`font-mono text-xs ${cfg.class}`}>{cfg.label}</Badge>
                      </div>
                      <h3 className="text-2xl font-black font-mono uppercase tracking-tighter">{phase.label}</h3>
                      <p className="text-muted-foreground text-sm">{phase.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Tiến độ</span>
                      <span className="font-bold text-foreground">{phase.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isDone ? "bg-green-500" : "bg-primary"}`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {phase.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? "bg-green-400" : isBuilding ? "bg-primary" : "bg-muted-foreground"}`} />
                        {f}
                      </div>
                    ))}
                  </div>

                  {phase.href && (
                    <Link href={phase.href}>
                      <Button size="sm" className="w-full font-mono uppercase font-bold gap-2">
                        <Play className="w-3.5 h-3.5" /> Trải Nghiệm Ngay
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-mono font-bold uppercase tracking-tighter text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Kiểm Tra Thiết Bị
            </h3>
            <XRDeviceChecker />
          </div>

          <div className="text-center p-10 rounded-2xl border border-primary/20 bg-primary/5 space-y-4 flex flex-col justify-center">
            <Glasses className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-2xl font-black font-mono uppercase">Phase 4 — Đang Build</h3>
            <p className="text-muted-foreground font-mono max-w-lg mx-auto text-sm">
              Sân vận động 3D đã hoạt động. WebXR VR/AR sẵn sàng cho thiết bị tương thích. AR overlay thống kê live đang chạy.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/vr-stadium">
                <Button className="font-mono uppercase font-bold gap-2">
                  <Glasses className="w-4 h-4" /> Vào Sân 3D
                </Button>
              </Link>
              <Link href="/leagues">
                <Button variant="outline" className="font-mono uppercase font-bold gap-2">
                  <Trophy className="w-4 h-4" /> Giải Đấu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
