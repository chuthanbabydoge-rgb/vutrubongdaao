import { Link } from "wouter";
import { useGetStatsOverview, useGetLiveMatches, useListLeagues, useGetRecentMatches } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/ui/match-card";
import { LeagueCard } from "@/components/ui/league-card";
import { Trophy, Activity, Users, Radio, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: stats } = useGetStatsOverview();
  const { data: liveMatchesRaw } = useGetLiveMatches();
  const { data: recentMatchesRaw } = useGetRecentMatches();
  const { data: leaguesRaw } = useListLeagues();

  const liveMatches = Array.isArray(liveMatchesRaw) ? liveMatchesRaw : [];
  const recentMatches = Array.isArray(recentMatchesRaw) ? recentMatchesRaw : [];
  const leagues = Array.isArray(leaguesRaw) ? leaguesRaw : [];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 border-b border-border/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee1251e6005')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="container relative z-10 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm mb-4">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>VIRTUAL UNIVERSE ONLINE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase font-mono max-w-4xl leading-[0.9]">
            Conquer The <span className="text-primary glow-text block mt-2">Cosmic Pitch</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-mono tracking-wide mt-4">
            Step into the most immersive football simulation platform. Manage your career, join legendary clubs, and dominate global leagues.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-mono font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
                Start Career
              </Button>
            </Link>
            <Link href="/leagues">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-mono font-bold uppercase tracking-wider bg-background/50 backdrop-blur">
                Explore Leagues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {stats && (
        <section className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-card/30 border border-border/40 rounded-lg text-center backdrop-blur-sm">
              <Trophy className="w-8 h-8 text-primary mb-3 opacity-80" />
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{stats.totalLeagues}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold mt-1">Leagues</div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-card/30 border border-border/40 rounded-lg text-center backdrop-blur-sm">
              <Users className="w-8 h-8 text-primary mb-3 opacity-80" />
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{stats.totalTeams}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold mt-1">Teams</div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-card/30 border border-border/40 rounded-lg text-center backdrop-blur-sm">
              <Activity className="w-8 h-8 text-primary mb-3 opacity-80" />
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{stats.totalPlayers}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold mt-1">Players</div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-card/30 border border-border/40 rounded-lg text-center backdrop-blur-sm">
              <Radio className="w-8 h-8 text-primary mb-3 opacity-80" />
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{stats.liveMatches}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold mt-1">Live Matches</div>
            </div>
          </div>
        </section>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section className="container space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Live Matches
            </h2>
            <Link href="/matches">
              <Button variant="ghost" className="font-mono text-sm uppercase tracking-wider">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.slice(0, 3).map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Top Leagues */}
      {leagues.length > 0 && (
        <section className="container space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
              <Trophy className="text-primary w-6 h-6" />
              Top Leagues
            </h2>
            <Link href="/leagues">
              <Button variant="ghost" className="font-mono text-sm uppercase tracking-wider">
                Explore All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leagues.slice(0, 4).map(league => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        </section>
      )}
      
      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <section className="container space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
              <Activity className="text-muted-foreground w-6 h-6" />
              Recent Results
            </h2>
            <Link href="/matches">
              <Button variant="ghost" className="font-mono text-sm uppercase tracking-wider">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMatches.slice(0, 3).map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
