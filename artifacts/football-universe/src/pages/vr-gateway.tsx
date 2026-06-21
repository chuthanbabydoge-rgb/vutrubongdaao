import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Cpu, Glasses, Waves, Globe, Lock, ArrowRight, Radio, Trophy, Activity } from "lucide-react";

const PHASES = [
  {
    phase: "Phase 1",
    label: "2D Universe",
    status: "active",
    description: "Full web platform with real-time match data, leagues, and team management.",
    features: ["19+ Global Leagues", "Real-time Match Scores", "Player Database", "League Standings"],
    icon: Globe,
  },
  {
    phase: "Phase 2",
    label: "3D Immersion",
    status: "upcoming",
    description: "3D stadium environments, tactical camera views, and enhanced match visualization.",
    features: ["3D Stadium Rendering", "Tactical View", "Match Replays", "Player Tracking"],
    icon: Cpu,
  },
  {
    phase: "Phase 3",
    label: "VR Access",
    status: "planned",
    description: "Full VR headset support. Step into the stadium, manage from the sideline, feel every moment.",
    features: ["VR Headset Support", "Spatial Audio", "Touchline Management", "Social VR Spaces"],
    icon: Glasses,
  },
  {
    phase: "Phase 4",
    label: "AR/XR Universe",
    status: "planned",
    description: "Mixed reality overlays. Watch matches projected onto your real world, anywhere.",
    features: ["AR Match Overlay", "XR Spectator Mode", "Real-world Integration", "Global AR Events"],
    icon: Waves,
  },
];

const statusConfig = {
  active: { label: "ACTIVE", class: "bg-green-500/10 text-green-400 border-green-500/30" },
  upcoming: { label: "IN DEVELOPMENT", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  planned: { label: "PLANNED", class: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
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
            VR/AR/XR GATEWAY — COMING SOON
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-mono tracking-tighter uppercase leading-[0.9]">
            Enter The <span className="text-primary block">Cosmic Pitch</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            From web to VR to AR — experience football simulation across every dimension of reality.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  <Rocket className="w-5 h-5 mr-2" /> Begin Your Journey
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 font-mono font-bold uppercase tracking-wider">
                <ArrowRight className="w-5 h-5 mr-2" /> Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Phase Roadmap */}
      <div className="container py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black font-mono uppercase tracking-tighter">
            Immersion <span className="text-primary">Roadmap</span>
          </h2>
          <p className="text-muted-foreground font-mono">Four phases of expanding reality</p>
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
          <h3 className="text-2xl font-black font-mono uppercase">Phase 1 — Now Live</h3>
          <p className="text-muted-foreground font-mono max-w-lg mx-auto">
            Vũ Trụ Bóng Đá Ảo is live on the web. Explore leagues, track matches, and build your football universe.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/leagues">
              <Button variant="outline" className="font-mono uppercase font-bold">
                <Trophy className="w-4 h-4 mr-2" /> Explore Leagues
              </Button>
            </Link>
            <Link href="/matches">
              <Button variant="outline" className="font-mono uppercase font-bold">
                <Activity className="w-4 h-4 mr-2" /> Watch Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
