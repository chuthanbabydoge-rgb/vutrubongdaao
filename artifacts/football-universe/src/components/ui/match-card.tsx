import { Link } from "wouter";
import { type Match } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live";

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover-elevate cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 group bg-card/50 backdrop-blur-sm">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-primary/80">{match.leagueName}</span>
            <div className="flex items-center gap-2">
              {isLive ? (
                <Badge variant="default" className="bg-primary text-primary-foreground animate-pulse font-mono">
                  TRỰC TIẾP {match.minute}'
                </Badge>
              ) : match.status === "finished" ? (
                <Badge variant="secondary" className="font-mono bg-muted text-muted-foreground">KT</Badge>
              ) : (
                <span className="font-mono">{format(new Date(match.scheduledAt), "dd/MM HH:mm")}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                {match.homeTeamLogoUrl ? (
                  <img src={match.homeTeamLogoUrl} alt={match.homeTeamName} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">{match.homeTeamName.charAt(0)}</span>
                )}
              </div>
              <span className="text-sm font-bold text-center line-clamp-1">{match.homeTeamName}</span>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              <div className="font-mono text-3xl font-black tabular-nums tracking-tighter">
                {match.status === "upcoming" ? (
                  <span className="text-muted-foreground/50">vs</span>
                ) : (
                  <span className="text-foreground">
                    {match.homeScore} - {match.awayScore}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                {match.awayTeamLogoUrl ? (
                  <img src={match.awayTeamLogoUrl} alt={match.awayTeamName} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">{match.awayTeamName.charAt(0)}</span>
                )}
              </div>
              <span className="text-sm font-bold text-center line-clamp-1">{match.awayTeamName}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
