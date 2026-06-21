import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetRecentMatches, useListLeagues, useGetStatsOverview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MatchCard } from "@/components/ui/match-card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Activity, ArrowRight, Rocket, Star, Globe } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats } = useGetStatsOverview();
  const { data: recentMatches } = useGetRecentMatches();
  const { data: leagues } = useListLeagues();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="container py-12 space-y-10">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
        <div className="space-y-2">
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">{greeting}, Chỉ Huy</p>
          <h1 className="text-4xl font-black font-mono tracking-tighter uppercase">
            {user.displayName ?? user.username}
            <span className="text-primary ml-2">⚽</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono">{user.username}</Badge>
            <Badge variant="outline" className="font-mono">{user.email}</Badge>
            {user.teamId && <Badge className="font-mono bg-primary/10 text-primary border-primary/30">Đã Có Đội</Badge>}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/vr-gateway">
            <Button className="font-mono font-bold uppercase tracking-wider">
              <Rocket className="w-4 h-4 mr-2" /> Vào VR
            </Button>
          </Link>
          <Link href="/teams">
            <Button variant="outline" className="font-mono font-bold uppercase tracking-wider">
              <Users className="w-4 h-4 mr-2" /> Xem CLB
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Trophy, label: "Giải Đấu", value: stats.totalLeagues, color: "text-yellow-400" },
            { icon: Users, label: "Câu Lạc Bộ", value: stats.totalTeams, color: "text-blue-400" },
            { icon: Star, label: "Cầu Thủ", value: stats.totalPlayers, color: "text-primary" },
            { icon: Activity, label: "Trận Đấu", value: stats.totalMatches, color: "text-green-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="p-6 bg-card/40 border-border/40 text-center">
              <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
              <div className="text-3xl font-black font-mono">{value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* Recent Matches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-mono uppercase tracking-tighter flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Kết Quả Gần Đây
            </h2>
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="font-mono text-xs uppercase">
                Xem Tất Cả <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {(recentMatches ?? []).slice(0, 4).map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
            {!recentMatches?.length && (
              <Card className="p-8 text-center bg-card/30 border-border/30">
                <p className="text-muted-foreground font-mono text-sm">Chưa có trận đấu gần đây</p>
              </Card>
            )}
          </div>
        </div>

        {/* Leagues */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-mono uppercase tracking-tighter flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Giải Đấu
            </h2>
            <Link href="/leagues">
              <Button variant="ghost" size="sm" className="font-mono text-xs uppercase">
                Xem Tất Cả <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {(leagues ?? []).slice(0, 8).map(league => (
              <Link key={league.id} href={`/leagues/${league.id}`}>
                <div className="group flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/30 hover:border-primary/40 hover:bg-card/60 transition-all cursor-pointer">
                  <div>
                    <div className="font-bold text-sm group-hover:text-primary transition-colors">{league.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{league.region} · {league.teamCount} đội</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
