import { Link } from "wouter";
import { type League } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Globe, Users } from "lucide-react";

export function LeagueCard({ league }: { league: League }) {
  return (
    <Link href={`/leagues/${league.id}`}>
      <Card className="group relative overflow-hidden bg-card/40 hover:bg-card/80 border-border/40 hover:border-primary/50 transition-all duration-500 cursor-pointer h-full">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="p-6 flex flex-col items-center text-center gap-4 relative z-10">
          <div className="w-24 h-24 rounded-full bg-background border-2 border-border/50 group-hover:border-primary/50 flex items-center justify-center overflow-hidden transition-colors shadow-xl">
            {league.logoUrl ? (
              <img src={league.logoUrl} alt={league.name} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <Globe className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
          
          <div className="space-y-1 w-full">
            <h3 className="font-bold text-lg leading-tight tracking-tight">{league.name}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
              {league.region} {league.country ? `• ${league.country}` : ''}
            </p>
          </div>
          
          <div className="mt-2 flex items-center justify-center gap-4 text-xs font-mono text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border/30 w-full">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{league.teamCount || 0} TEAMS</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <span className="uppercase text-primary/80">{league.type}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
