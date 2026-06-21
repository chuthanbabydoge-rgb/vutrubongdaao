import { useParams, Link } from "wouter";
import { useGetTeam, useGetTeamPlayers } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Users, ArrowLeft, MapPin, Calendar, Star } from "lucide-react";

const POSITION_ORDER = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "CF"];

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id ?? "0");

  const { data: team, isLoading } = useGetTeam({ teamId });
  const { data: players } = useGetTeamPlayers({ teamId });

  const sortedPlayers = (players ?? []).slice().sort((a, b) =>
    POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
  );

  if (isLoading) return (
    <div className="container py-12 space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!team) return <div className="container py-12 text-center text-muted-foreground font-mono">Không tìm thấy đội bóng.</div>;

  const ratingBg = (r: number) => r >= 90 ? "text-yellow-400" : r >= 85 ? "text-primary" : r >= 80 ? "text-blue-400" : "text-muted-foreground";

  return (
    <div className="container py-12 space-y-10">
      <Link href="/teams">
        <Button variant="ghost" className="font-mono text-sm uppercase -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tất Cả CLB
        </Button>
      </Link>

      {/* Team Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-8"
        style={{ background: `linear-gradient(135deg, ${team.primaryColor ?? "#111"}15 0%, transparent 60%)` }}>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-28 h-28 rounded-full flex items-center justify-center text-2xl font-black font-mono flex-shrink-0 border-4"
            style={{ backgroundColor: (team.primaryColor ?? "#333") + "20", color: team.primaryColor ?? "#888", borderColor: team.primaryColor ?? "#333" }}>
            {team.shortName}
          </div>
          <div className="space-y-3 flex-1">
            <h1 className="text-4xl font-black font-mono uppercase tracking-tighter">{team.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">{team.type === "national" ? "Đội Tuyển Quốc Gia" : "Câu Lạc Bộ"}</Badge>
              <Badge variant="outline" className="font-mono flex items-center gap-1"><MapPin className="w-3 h-3" />{team.country}</Badge>
              {team.founded && <Badge variant="outline" className="font-mono flex items-center gap-1"><Calendar className="w-3 h-3" />Năm lập: {team.founded}</Badge>}
            </div>
            {team.stadiumName && (
              <p className="text-muted-foreground font-mono text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {team.stadiumName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Squad */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" /> Đội Hình <span className="text-muted-foreground text-base font-normal">({sortedPlayers.length} cầu thủ)</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border/40">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-border/40 bg-card/60">
                <th className="text-left py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider w-10">#</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-bold uppercase text-xs tracking-wider">Cầu Thủ</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">Vị Trí</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">QT</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">Tuổi</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider">
                  <Star className="w-3 h-3 inline" />
                </th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider hidden md:table-cell">BT</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-bold uppercase text-xs tracking-wider hidden md:table-cell">KT</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map(player => (
                <tr key={player.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{player.number}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} size={32} />
                      <Link href={`/players/${player.id}`} className="font-bold hover:text-primary transition-colors">{player.name}</Link>
                    </div>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">{player.position}</span>
                  </td>
                  <td className="text-center py-3 px-3 text-muted-foreground">{player.nationality}</td>
                  <td className="text-center py-3 px-3">{player.age}</td>
                  <td className="text-center py-3 px-3">
                    <span className={`font-black text-base ${ratingBg(player.rating ?? 0)}`}>{player.rating}</span>
                  </td>
                  <td className="text-center py-3 px-3 text-green-400 hidden md:table-cell">{player.goals}</td>
                  <td className="text-center py-3 px-3 text-blue-400 hidden md:table-cell">{player.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedPlayers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">Chưa có dữ liệu cầu thủ.</div>
          )}
        </div>
      </div>
    </div>
  );
}
