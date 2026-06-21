import { useState } from "react";
import { Link } from "wouter";
import { useListTeams } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Globe } from "lucide-react";

const REGIONS = ["All", "Europe", "Asia", "Americas", "Africa"];
const TYPES = ["All", "club", "national"];

export default function Teams() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");

  const { data: teams, isLoading } = useListTeams({
    region: region !== "All" ? region : undefined,
    type: type !== "All" ? (type as "club" | "national") : undefined,
  });

  const filtered = (teams ?? []).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter flex items-center gap-4">
          <Users className="w-10 h-10 text-primary" />
          All <span className="text-primary">Teams</span>
        </h1>
        <p className="text-muted-foreground font-mono">{teams?.length ?? 0} teams across all competitions</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search teams..." className="pl-10 bg-background/50 font-mono" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(r => (
            <Button key={r} size="sm" variant={region === r ? "default" : "outline"} className="font-mono text-xs uppercase" onClick={() => setRegion(r)}>{r}</Button>
          ))}
          <div className="w-px bg-border mx-2" />
          {TYPES.map(t => (
            <Button key={t} size="sm" variant={type === t ? "default" : "outline"} className="font-mono text-xs uppercase" onClick={() => setType(t)}>
              {t === "club" ? "Club" : t === "national" ? "National" : t}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(team => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div className="group p-5 rounded-xl border border-border/40 bg-card/40 hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black font-mono flex-shrink-0"
                    style={{ backgroundColor: (team.primaryColor ?? "#333") + "25", color: team.primaryColor ?? "#888", border: `2px solid ${team.primaryColor ?? "#333"}40` }}>
                    {team.shortName}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold group-hover:text-primary transition-colors truncate">{team.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" />{team.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span className="truncate">{team.stadiumName}</span>
                  <span>Est. {team.founded}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-mono">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No teams match your search.</p>
        </div>
      )}
    </div>
  );
}
