import { useState } from "react";
import { Link } from "wouter";
import { FootballStadium3D, type StadiumPlayer } from "@/components/vr/football-stadium-3d";
import { ARStatsOverlay } from "@/components/vr/ar-stats-overlay";
import { XRDeviceChecker } from "@/components/vr/xr-device-checker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Glasses, MonitorSmartphone, Cpu, Info, Radio, Users, Move, Waves } from "lucide-react";
import { useListPlayers, useListMatches } from "@workspace/api-client-react";

export default function VRStadium() {
  const [activeXR, setActiveXR] = useState<"vr" | "ar" | null>(null);

  const { data: rawPlayers } = useListPlayers();
  const { data: liveMatches } = useListMatches({ status: "live" });
  const { data: recentMatches } = useListMatches({ status: "finished" });

  const players: StadiumPlayer[] = (rawPlayers ?? [])
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 22)
    .map(p => ({
      id: p.id,
      name: p.name ?? "Cầu thủ",
      position: p.position ?? "MF",
      rating: p.rating ?? 75,
      teamId: p.teamId,
    }));

  const currentMatch = (liveMatches ?? [])[0] ?? (recentMatches ?? [])[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/vr-gateway">
            <Button variant="ghost" size="sm" className="font-mono gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Cổng VR
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-sm font-bold uppercase tracking-wider">Sân Vận Động 3D — Phase 4</span>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge className="font-mono text-xs bg-primary/10 text-primary border-primary/30">Phase 4.1–4.3</Badge>
            <Badge className="font-mono text-xs bg-green-500/10 text-green-400 border-green-400/30">WebXR</Badge>
            <Badge className="font-mono text-xs bg-blue-500/10 text-blue-400 border-blue-400/30">Three.js</Badge>
            {players.length > 0 && (
              <Badge className="font-mono text-xs bg-yellow-500/10 text-yellow-400 border-yellow-400/30">
                <Users className="w-3 h-3 mr-1" />{players.length} cầu thủ API
              </Badge>
            )}
          </div>
        </div>

        {/* Current match banner */}
        {currentMatch && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">
                {(liveMatches ?? []).length > 0 ? "TRẬN ĐANG DIỄN RA" : "TRẬN GẦN NHẤT"}
              </span>
            </div>
            <div className="font-mono font-bold text-sm">
              Đội {currentMatch.homeTeamId} &nbsp;
              <span className="text-primary">{currentMatch.homeScore ?? 0} — {currentMatch.awayScore ?? 0}</span>
              &nbsp; Đội {currentMatch.awayTeamId}
            </div>
            <Badge className={`text-xs font-mono ${currentMatch.status === "live" ? "bg-red-500/20 text-red-400 border-red-400/30" : "bg-muted/30 text-muted-foreground border-border/30"}`}>
              {currentMatch.status === "live" ? "⚡ LIVE" : currentMatch.status === "finished" ? "✅ Kết thúc" : "⏳ Sắp diễn ra"}
            </Badge>
          </div>
        )}

        {/* Main grid */}
        <div className="grid xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {/* 3D Stadium */}
            <FootballStadium3D
              players={players}
              className="w-full"
              style={{ height: "530px" }}
              onXREnter={(mode) => setActiveXR(mode)}
            />

            {/* Feature cards */}
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

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Move, label: "Locomotion WASD", desc: "Nhấn nút Move ▲ góc phải để đi bộ quanh sân. WASD di chuyển, kéo chuột nhìn xung quanh, Shift tăng tốc.", color: "text-orange-400" },
                { icon: Users, label: "Multiplayer Avatars", desc: `${players.length} cầu thủ thật từ API đang chạy trên sân với tên hiển thị. Đội xanh lá vs đội xanh dương.`, color: "text-yellow-400" },
                { icon: Waves, label: "Dynamic Crowd", desc: "1200+ khán giả ảo trên khán đài với hiệu ứng sóng \"wave\" cổ vũ theo thời gian thực.", color: "text-purple-400" },
                { icon: Radio, label: "WebXR VR/AR", desc: "Nhấn VÀO VR/AR để vào kính thực tế ảo. Hỗ trợ hand tracking & hit-test trên thiết bị tương thích.", color: "text-primary" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="rounded-xl border border-border/20 bg-card/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="font-mono font-bold text-xs">{label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
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

              <TabsContent value="info" className="mt-3 space-y-3">
                <div className="bg-card/40 border border-border/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="font-mono font-bold text-sm uppercase">Cách Điều Khiển</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                      { title: "🖱️ Orbit Mode (mặc định)", body: "Kéo chuột xoay góc nhìn. Cuộn zoom. Chạm 2 ngón trên mobile để thu phóng." },
                      { title: "🚶 Walk Mode (WASD)", body: "Nhấn nút ▲ góc phải để vào chế độ đi bộ. WASD/mũi tên di chuyển. Kéo chuột nhìn xung quanh. Shift chạy nhanh." },
                      { title: "🥽 Immersive VR", body: "Kết nối kính VR → nhấn 'VÀO VR'. Dùng thumbstick di chuyển, nhìn bằng đầu." },
                      { title: "📱 AR Mode", body: "Android Chrome / thiết bị WebXR AR → nhấn 'VÀO AR' để chiếu sân lên thế giới thực qua camera." },
                      { title: "👥 Cầu thủ thật", body: `${players.length} cầu thủ top rating từ database đang chạy trên sân. Tên hiển thị nổi phía trên đầu.` },
                      { title: "🌊 Khán đài động", body: "1200+ khán giả ảo cổ vũ với hiệu ứng sóng wave tự động theo thời gian thực." },
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
                  {[
                    { name: "Meta Quest 2/3/Pro", status: "✅ VR + AR" },
                    { name: "Apple Vision Pro", status: "✅ VR + AR" },
                    { name: "PlayStation VR2", status: "✅ VR" },
                    { name: "Android + Chrome", status: "✅ AR (WebXR)" },
                    { name: "HTC Vive / Valve Index", status: "✅ VR (SteamVR)" },
                    { name: "Mọi trình duyệt khác", status: "⚡ 3D + Walk" },
                  ].map(({ name, status }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono">{name}</span>
                      <span className="font-mono font-bold">{status}</span>
                    </div>
                  ))}
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
                    ? "Nhìn xung quanh bằng đầu, dùng thumbstick di chuyển trong không gian 3D."
                    : "Hướng camera vào mặt phẳng để đặt sân bóng vào thế giới thực."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
