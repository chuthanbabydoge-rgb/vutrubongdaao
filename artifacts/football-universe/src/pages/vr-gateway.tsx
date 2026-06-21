import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Cpu, Glasses, Waves, Globe, Lock, ArrowRight, Radio, Trophy, Activity } from "lucide-react";

const PHASES = [
  {
    phase: "Giai Đoạn 1",
    label: "Vũ Trụ 2D",
    status: "active",
    description: "Nền tảng web đầy đủ với dữ liệu trận đấu thời gian thực, các giải đấu và quản lý đội bóng.",
    features: ["19+ Giải Đấu Toàn Cầu", "Kết Quả Trực Tiếp", "Cơ Sở Dữ Liệu Cầu Thủ", "Bảng Xếp Hạng Giải Đấu"],
    icon: Globe,
  },
  {
    phase: "Giai Đoạn 2",
    label: "Đắm Chìm 3D",
    status: "upcoming",
    description: "Môi trường sân vận động 3D, góc nhìn chiến thuật và trực quan hóa trận đấu nâng cao.",
    features: ["Sân Vận Động 3D", "Góc Nhìn Chiến Thuật", "Phát Lại Trận Đấu", "Theo Dõi Cầu Thủ"],
    icon: Cpu,
  },
  {
    phase: "Giai Đoạn 3",
    label: "Truy Cập VR",
    status: "planned",
    description: "Hỗ trợ kính VR đầy đủ. Bước vào sân vận động, quản lý từ đường biên, cảm nhận từng khoảnh khắc.",
    features: ["Hỗ Trợ Kính VR", "Âm Thanh Không Gian", "Quản Lý Đường Biên", "Không Gian VR Xã Hội"],
    icon: Glasses,
  },
  {
    phase: "Giai Đoạn 4",
    label: "Vũ Trụ AR/XR",
    status: "planned",
    description: "Lớp phủ thực tế ảo hỗn hợp. Xem trận đấu được chiếu vào thế giới thực của bạn, ở bất cứ đâu.",
    features: ["Lớp Phủ AR", "Chế Độ Khán Giả XR", "Tích Hợp Thế Giới Thực", "Sự Kiện AR Toàn Cầu"],
    icon: Waves,
  },
];

const statusConfig = {
  active: { label: "ĐANG HOẠT ĐỘNG", class: "bg-green-500/10 text-green-400 border-green-500/30" },
  upcoming: { label: "ĐANG PHÁT TRIỂN", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  planned: { label: "DỰ KIẾN", class: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

export default function VRGateway() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden py-24 border-b border-border/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
        <div className="container relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm">
            <Radio className="w-4 h-4 animate-pulse" />
            CỔNG VR/AR/XR — SẮP RA MẮT
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-mono tracking-tighter uppercase leading-[0.9]">
            Bước Vào <span className="text-primary block">Sân Cỏ Vũ Trụ</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Từ web đến VR đến AR — trải nghiệm mô phỏng bóng đá qua mọi chiều không gian thực tế.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  <Rocket className="w-5 h-5 mr-2" /> Bắt Đầu Hành Trình
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  Đăng Nhập
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                <ArrowRight className="w-5 h-5 mr-2" /> Đến Bảng Điều Khiển
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Phase Roadmap */}
      <div className="container py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black font-mono uppercase tracking-tighter">
            Lộ Trình <span className="text-primary">Đắm Chìm</span>
          </h2>
          <p className="text-muted-foreground font-mono">Bốn giai đoạn mở rộng thực tế</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            const cfg = statusConfig[phase.status as keyof typeof statusConfig];
            const isLocked = phase.status !== "active";
            return (
              <div key={idx} className={`relative p-8 rounded-2xl border transition-all space-y-6 ${isLocked ? "border-border/30 bg-card/20 opacity-80" : "border-primary/40 bg-card/40 shadow-[0_0_30px_-10px] shadow-primary/20"}`}>
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isLocked ? "bg-muted/20" : "bg-primary/10 border border-primary/30"}`}>
                    <Icon className={`w-7 h-7 ${isLocked ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{phase.phase}</span>
                      <Badge className={`font-mono text-xs ${cfg.class}`}>{cfg.label}</Badge>
                    </div>
                    <h3 className="text-2xl font-black font-mono uppercase tracking-tighter">{phase.label}</h3>
                    <p className="text-muted-foreground text-sm">{phase.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {phase.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLocked ? "bg-muted-foreground" : "bg-primary"}`} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status Box */}
        <div className="text-center p-10 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <Globe className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-2xl font-black font-mono uppercase">Giai Đoạn 1 — Đang Hoạt Động</h3>
          <p className="text-muted-foreground font-mono max-w-lg mx-auto">
            Vũ Trụ Bóng Đá Ảo đang hoạt động trên web. Khám phá giải đấu, theo dõi trận đấu và xây dựng vũ trụ bóng đá của bạn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/leagues">
              <Button variant="outline" className="font-mono uppercase font-bold">
                <Trophy className="w-4 h-4 mr-2" /> Khám Phá Giải Đấu
              </Button>
            </Link>
            <Link href="/matches">
              <Button variant="outline" className="font-mono uppercase font-bold">
                <Activity className="w-4 h-4 mr-2" /> Xem Trận Đấu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
