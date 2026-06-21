import { useParams, Link } from "wouter";
import { useGetLeague, useListTeams, useGetLeagueStandings, useGetLeagueMatches } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCard } from "@/components/ui/match-card";
import { Trophy, Users, Calendar, ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const regionLabel: Record<string, string> = {
  Europe: "Châu Âu",
  Asia: "Châu Á",
  Americas: "Châu Mỹ",
  Africa: "Châu Phi",
  International: "Quốc Tế",
};

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const leagueId = parseInt(id ?? "0");

  const { data: league, isLoading } = useGetLeague(leagueId);
  const { data: teams } = useListTeams({ leagueId });
  const { data: standings } = useGetLeagueStandings(leagueId);
  const { data: matches } = useGetLeagueMatches(leagueId, { status: "scheduled" });

  if (isLoading) return (
    <div className="container py-12 space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!league) return (
    <div className="container py-12 text-center text-muted-foreground font-mono">Không tìm thấy giải đấu.</div>
  );

  return (
    <div className="container py-12 space-y-8">
      <Link href="/leagues">
        <Button variant="ghost" className="font-mono text-sm uppercase -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tất Cả Giải Đấu
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-black font-mono uppercase tracking-tighter">{league.name}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="font-mono">{regionLabel[league.region] ?? league.region}</Badge>
            {league.country && (
              <Badge variant="outline" className="font-mono flex items-center gap-1">
                <Globe className="w-3 h-3" />{league.country}
              </Badge>
            )}
            <Badge variant="outline" className="font-mono">{league.type === "national" ? "Quốc Gia" : "CLB"}</Badge>
            <span className="text-muted-foreground font-mono text-sm">Mùa {league.season}</span>
          </div>
          {league.description && <p className="text-muted-foreground max-w-xl">{league.description}</p>}
        </div>
        <div className="flex gap-4">
          <div className="text-center p-4 bg-card/40 rounded-lg border border-border/40">
            <div className="text-2xl font-black font-mono">{(teams ?? []).length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Đội Bóng</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="standings" className="space-y-6">
        <TabsList className="bg-card/40 border border-border/40">
          <TabsTrigger value="standings" className="font-mono uppercase text-xs">Bảng Xếp Hạng</TabsTrigger>
          <TabsTrigger value="teams" className="font-mono uppercase text-xs">Đội Bóng</TabsTrigger>
          <TabsTrigger value="matches" className="font-mono uppercase text-xs">Lịch Thi Đấu</TabsTrigger>
        </TabsList>

        {/* STANDINGS */}
        <TabsContent value="standings">
          {standings && standings.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-border/40 bg-card/60">
                    <th className="text-left py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider w-8">#</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider">Đội</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">Tr</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">T</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">H</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">B</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">BT</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">BB</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">HS</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider">Điểm</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider hidden md:table-cell">Phong Độ</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, idx) => (
                    <tr key={s.id} className={`border-b border-border/20 hover:bg-primary/5 transition-colors ${idx < 4 ? "border-l-2 border-l-primary" : ""}`}>
                      <td className="py-3 px-4 text-muted-foreground font-bold">{s.position}</td>
                      <td className="py-3 px-4">
                        <Link href={`/teams/${s.teamId}`} className="font-bold hover:text-primary transition-colors">{s.teamName}</Link>
                      </td>
                      <td className="text-center py-3 px-3">{s.played}</td>
                      <td className="text-center py-3 px-3 text-green-400">{s.won}</td>
                      <td className="text-center py-3 px-3 text-yellow-400">{s.drawn}</td>
                      <td className="text-center py-3 px-3 text-red-400">{s.lost}</td>
                      <td className="text-center py-3 px-3">{s.goalsFor}</td>
                      <td className="text-center py-3 px-3">{s.goalsAgainst}</td>
                      <td className="text-center py-3 px-3 text-muted-foreground">
                        {s.goalsFor - s.goalsAgainst > 0 ? `+${s.goalsFor - s.goalsAgainst}` : s.goalsFor - s.goalsAgainst}
                      </td>
                      <td className="text-center py-3 px-4 font-black text-primary text-base">{s.points}</td>
                      <td className="text-center py-3 px-4 hidden md:table-cell">
                        <div className="flex gap-1 justify-center">
                          {(s.form ?? "").split("").map((f, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <span key={i} className={`w-5 h-5 rounded-sm text-xs font-bold flex items-center justify-center ${f === "W" ? "bg-green-500/20 text-green-400" : f === "D" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                              {f === "W" ? "T" : f === "D" ? "H" : "B"}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground font-mono">Chưa có dữ liệu bảng xếp hạng.</div>
          )}
        </TabsContent>

        {/* TEAMS */}
        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(teams ?? []).map(team => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <div className="group p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-mono"
                    style={{ backgroundColor: (team.primaryColor ?? "#333") + "20", color: team.primaryColor ?? "#888", border: `2px solid ${team.primaryColor ?? "#333"}40` }}>
                    {team.shortName}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold group-hover:text-primary transition-colors truncate">{team.name}</div>
                    <div className="text-xs text-muted-foreground">{team.country} · Năm lập {team.founded}</div>
                  </div>
                  <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          {!(teams ?? []).length && <div className="text-center py-16 text-muted-foreground font-mono">Không có đội bóng nào.</div>}
        </TabsContent>

        {/* FIXTURES */}
        <TabsContent value="matches">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(matches ?? []).map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
          {!matches?.length && (
            <div className="text-center py-16 text-muted-foreground font-mono">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Không có lịch thi đấu sắp tới.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
