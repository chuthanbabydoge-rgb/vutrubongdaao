import { useState } from "react";
import { Link } from "wouter";
import { FootballStadium3D } from "@/components/vr/football-stadium-3d";
import { ARStatsOverlay } from "@/components/vr/ar-stats-overlay";
import { XRDeviceChecker } from "@/components/vr/xr-device-checker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Glasses, MonitorSmartphone, Cpu, Info, Radio } from "lucide-react";

export default function VRStadium() {
  const [activeXR, setActiveXR] = useState<"vr" | "ar" | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/vr-gateway">
            <Button variant="ghost" size="sm" className="font-mono gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Cổng VR
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-sm font-bold uppercase tracking-wider">Sân Vận Động 3D</span>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge className="font-mono text-xs bg-primary/10 text-primary border-primary/30">Phase 4.1</Badge>
            <Badge className="font-mono text-xs bg-green-500/10 text-green-400 border-green-400/30">WebXR</Badge>
            <Badge className="font-mono text-xs bg-blue-500/10 text-blue-400 border-blue-400/30">Three.js</Badge>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <FootballStadium3D
              className="w-full"
              style={{ height: "520px" } as React.CSSProperties}
              onXREnter={(mode) => setActiveXR(mode)}
            />

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Glasses, label: "Immersive VR", desc: "Meta Quest · PS VR · Apple Vision Pro", color: "text-primary", bg: "bg-primary/5 border-primary/20" },
                { icon: MonitorSmartphone, label: "AR Overlay", desc: "Android Chrome · iOS Safari WebXR", color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/20" },
                { icon: Cpu, label: "3D Web", desc: "Mọi trình duyệt · Hardware-accelerated", color: "text-green-400", bg: "bg-green-500/5 border-green-500/20" },
              ].map(({ icon: Icon, label, desc, color, bg }) => (
                <div key={label} className={`rounded-xl border p-4 text-center space-y-2 ${bg}`}>
                  <Icon className={`w-6 h-6 mx-auto ${color}`} />
                  <div className="font-mono font-bold text-xs">{label}</div>
                  <div className="text-[10px] text-muted-foreground">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="ar">
              <TabsList className="w-full font-mono text-xs">
                <TabsTrigger value="ar" className="flex-1">AR Overlay</TabsTrigger>
                <TabsTrigger value="device" className="flex-1">Thiết Bị</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Hướng Dẫn</TabsTrigger>
              </TabsList>

              <TabsContent value="ar" className="mt-3">
                <ARStatsOverlay />
              </TabsContent>

              <TabsContent value="device" className="mt-3">
                <XRDeviceChecker />
              </TabsContent>

              <TabsContent value="info" className="mt-3">
                <div className="space-y-3">
                  <div className="bg-card/40 border border-border/30 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <h3 className="font-mono font-bold text-sm uppercase">Cách Sử Dụng</h3>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      {[
                        { title: "🖱️ Điều hướng 3D", body: "Kéo chuột để xoay góc nhìn. Cuộn chuột để zoom. Chạm 2 ngón trên mobile để thu phóng." },
                        { title: "🥽 Vào VR", body: "Kết nối kính VR và nhấn nút 'VÀO VR'. Cần trình duyệt Chrome/Edge và thiết bị tương thích." },
                        { title: "📱 Chế Độ AR", body: "Trên Android Chrome hoặc thiết bị hỗ trợ WebXR AR, nhấn 'VÀO AR' để chiếu sân lên thế giới thực." },
                        { title: "📊 AR Stats", body: "Tab 'AR Overlay' hiển thị thống kê cầu thủ và trận đấu theo thời gian thực dạng heads-up display." },
                      ].map(({ title, body }) => (
                        <div key={title} className="rounded-xl bg-background/30 border border-border/20 p-3">
                          <div className="font-mono font-bold text-xs text-foreground mb-1">{title}</div>
                          <div className="text-xs">{body}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card/40 border border-border/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary animate-pulse" />
                      <h3 className="font-mono font-bold text-sm uppercase">Thiết Bị Được Hỗ Trợ</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "Meta Quest 2/3/Pro", status: "✅ VR + AR" },
                        { name: "Apple Vision Pro", status: "✅ VR + AR" },
                        { name: "PlayStation VR2", status: "✅ VR" },
                        { name: "Android + Chrome", status: "✅ AR (WebXR)" },
                        { name: "HTC Vive / Valve Index", status: "✅ VR (SteamVR)" },
                        { name: "Mọi trình duyệt khác", status: "⚡ 3D Web" },
                      ].map(({ name, status }) => (
                        <div key={name} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">{name}</span>
                          <span className="font-mono font-bold text-xs">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {activeXR && (
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <Glasses className="w-4 h-4" />
                  <span className="font-bold uppercase text-xs">
                    {activeXR === "vr" ? "🥽 Phiên VR Đang Hoạt Động" : "📱 Phiên AR Đang Hoạt Động"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {activeXR === "vr"
                    ? "Nhìn xung quanh bằng đầu, dùng tay cầm để tương tác với sân bóng."
                    : "Hướng camera vào mặt phẳng phẳng để đặt sân bóng vào thế giới thực."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
