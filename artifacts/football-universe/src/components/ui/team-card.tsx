import { Link } from "wouter";
import { type Team } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="group relative overflow-hidden bg-card/40 hover:bg-card/80 border-border/40 hover:border-primary/50 transition-all duration-500 cursor-pointer h-full">
        {team.primaryColor && (
          <div 
            className="absolute top-0 left-0 w-full h-2 opacity-50 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: team.primaryColor }}
          />
        )}
        <div className="p-6 flex flex-col items-center text-center gap-4 relative z-10 pt-8">
          <div className="w-20 h-20 rounded-full bg-background border border-border/50 group-hover:border-primary/50 flex items-center justify-center overflow-hidden transition-colors shadow-lg">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <Shield className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
          
          <div className="space-y-1 w-full">
            <h3 className="font-bold text-lg leading-tight tracking-tight">{team.name}</h3>
            {team.leagueName && (
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                {team.leagueName}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
