import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Search, Star, TrendingUp } from "lucide-react";

const POSITIONS = ["All", "GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "CF"];

const ratingColor = (r: number) =>
  r >= 90 ? "text-yellow-400" : r >= 85 ? "text-primary" : r >= 80 ? "text-blue-400" : "text-muted-foreground";

export default function Players() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("All");

  const { data: players, isLoading } = useListPlayers({
    position: position !== "All" ? position : undefined,
  });

  const filtered = (players ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter flex items-center gap-4">
          <User className="w-10 h-10 text-primary" />
          Player <span className="text-primary">Database</span>
        </h1>
        <p className="text-muted-foreground font-mono">{players?.length ?? 0} players in the virtual universe</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search players..." className="pl-10 bg-background/50 font-mono" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map(p => (
            <Button key={p} size="sm" variant={position === p ? "default" : "outline"} className="font-mono text-xs" onClick={() => setPosition(p)}>{p}</Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(player => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <div className="group p-5 rounded-xl border border-border/40 bg-card/40 hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-bold group-hover:text-primary transition-colors">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.nationality} · {player.teamName}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl font-black font-mono ${ratingColor(player.rating ?? 0)}`}>{player.rating}</span>
                    <span className="text-xs text-muted-foreground">OVR</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40 bg-primary/5">{player.position}</Badge>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono ml-auto">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{player.goals}G</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" />{player.assists}A</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-mono">
          <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No players match your search.</p>
        </div>
      )}
    </div>
  );
}
