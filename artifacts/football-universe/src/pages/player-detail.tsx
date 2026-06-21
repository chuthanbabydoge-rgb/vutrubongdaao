import { useParams, Link } from "wouter";
import { useGetPlayer } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Zap, Target, ArrowRightLeft, Dumbbell, Shield } from "lucide-react";

function StatBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 90 ? "bg-yellow-400" : value >= 80 ? "bg-primary" : value >= 70 ? "bg-blue-400" : value >= 60 ? "bg-green-400" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground w-5 flex-shrink-0">{icon}</div>
      <div className="text-xs text-muted-foreground w-20 font-mono uppercase tracking-wider flex-shrink-0">{label}</div>
      <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-sm font-black font-mono w-8 text-right">{value}</div>
    </div>
  );
}

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id ?? "0");
  const { data: player, isLoading } = useGetPlayer({ playerId });

  if (isLoading) return (
    <div className="container py-12 space-y-6 max-w-4xl">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!player) return <div className="container py-12 text-center text-muted-foreground font-mono">Player not found</div>;

  const ratingColor = (r: number) => r >= 90 ? "text-yellow-400" : r >= 85 ? "text-primary" : r >= 80 ? "text-blue-400" : "text-muted-foreground";

  return (
    <div className="container py-12 max-w-4xl space-y-10">
      <Link href="/players">
        <Button variant="ghost" className="font-mono text-sm uppercase -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> All Players
        </Button>
      </Link>

      {/* Player Card */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start bg-gradient-to-br from-primary/5 to-transparent">
          <div className="w-32 h-32 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-black font-mono text-primary">
              {player.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </span>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-black font-mono uppercase tracking-tighter">{player.name}</h1>
              <div className="text-muted-foreground font-mono">{player.nationality}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="font-mono text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30">{player.position}</Badge>
              {player.teamName && (
                <Link href={`/teams/${player.teamId}`}>
                  <Badge variant="outline" className="font-mono hover:border-primary/50 cursor-pointer">{player.teamName}</Badge>
                </Link>
              )}
              <Badge variant="outline" className="font-mono">#{player.number}</Badge>
              <Badge variant="outline" className="font-mono">Age {player.age}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`text-6xl font-black font-mono ${ratingColor(player.rating ?? 0)}`}>{player.rating}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall</div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-8 grid md:grid-cols-2 gap-8 border-t border-border/40">
          <div className="space-y-4">
            <h3 className="font-black font-mono uppercase tracking-tighter text-sm text-muted-foreground">Attributes</h3>
            <StatBar label="Pace" value={player.pace ?? 0} icon={<Zap className="w-4 h-4" />} />
            <StatBar label="Shooting" value={player.shooting ?? 0} icon={<Target className="w-4 h-4" />} />
            <StatBar label="Passing" value={player.passing ?? 0} icon={<ArrowRightLeft className="w-4 h-4" />} />
            <StatBar label="Dribbling" value={player.dribbling ?? 0} icon={<Star className="w-4 h-4" />} />
            <StatBar label="Defending" value={player.defending ?? 0} icon={<Shield className="w-4 h-4" />} />
            <StatBar label="Physical" value={player.physical ?? 0} icon={<Dumbbell className="w-4 h-4" />} />
          </div>

          <div className="space-y-4">
            <h3 className="font-black font-mono uppercase tracking-tighter text-sm text-muted-foreground">Season Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Goals", value: player.goals ?? 0, color: "text-green-400" },
                { label: "Assists", value: player.assists ?? 0, color: "text-blue-400" },
                { label: "Matches", value: player.matchesPlayed ?? 0, color: "text-primary" },
              ].map(stat => (
                <div key={stat.label} className="text-center p-4 bg-card/50 rounded-lg border border-border/30">
                  <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            {(player.matchesPlayed ?? 0) > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm font-mono text-muted-foreground">
                <div className="p-3 bg-card/30 rounded-lg">
                  <span className="text-xs uppercase tracking-wider block mb-1">Goals/Match</span>
                  <span className="text-foreground font-bold">{((player.goals ?? 0) / (player.matchesPlayed ?? 1)).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-card/30 rounded-lg">
                  <span className="text-xs uppercase tracking-wider block mb-1">Contrib/Match</span>
                  <span className="text-foreground font-bold">{(((player.goals ?? 0) + (player.assists ?? 0)) / (player.matchesPlayed ?? 1)).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
