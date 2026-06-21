import { useState } from "react";
import { Link } from "wouter";
import { useListLeagues } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Search, Globe, Users, ArrowRight } from "lucide-react";

const REGIONS = ["All", "Europe", "Asia", "Americas", "Africa", "International"];
const TYPES = ["All", "club", "national"];

export default function Leagues() {
  const { data: leagues, isLoading } = useListLeagues();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");

  const filtered = leagues?.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.country?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === "All" || l.region === region;
    const matchType = type === "All" || l.type === type;
    return matchSearch && matchRegion && matchType;
  }) ?? [];

  const regionColors: Record<string, string> = {
    Europe: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Asia: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Americas: "bg-green-500/10 text-green-400 border-green-500/20",
    Africa: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    International: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="container py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter flex items-center gap-4">
          <Trophy className="w-10 h-10 text-primary" />
          Global <span className="text-primary">Leagues</span>
        </h1>
        <p className="text-muted-foreground font-mono">Explore {leagues?.length ?? 0} competitions across {REGIONS.length - 1} regions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leagues..."
            className="pl-10 bg-background/50 font-mono"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(r => (
            <Button key={r} size="sm" variant={region === r ? "default" : "outline"} className="font-mono text-xs uppercase"
              onClick={() => setRegion(r)}>{r}</Button>
          ))}
          <div className="w-px bg-border mx-2" />
          {TYPES.map(t => (
            <Button key={t} size="sm" variant={type === t ? "default" : "outline"} className="font-mono text-xs uppercase"
              onClick={() => setType(t)}>{t === "club" ? "Club" : t === "national" ? "National" : t}</Button>
          ))}
        </div>
      </div>

      {/* League Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(league => (
            <Link key={league.id} href={`/leagues/${league.id}`}>
              <div className="group p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-black font-mono text-xl tracking-tight group-hover:text-primary transition-colors">
                      {league.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {league.country ?? league.region}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded border text-xs font-mono font-bold ${regionColors[league.region] ?? "bg-muted/20"}`}>
                    {league.region}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-mono">{league.teamCount} teams</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {league.type === "national" ? "National" : "Club"}
                    </Badge>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                {league.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{league.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-mono">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No leagues found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
