import { useState } from "react";
import { useListMatches } from "@workspace/api-client-react";
import { MatchCard } from "@/components/ui/match-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Calendar, Radio } from "lucide-react";

const STATUSES = ["all", "live", "scheduled", "finished"] as const;
type StatusFilter = typeof STATUSES[number];

export default function Matches() {
  const [status, setStatus] = useState<StatusFilter>("all");

  const { data: matches, isLoading } = useListMatches({
    status: status !== "all" ? (status as "live" | "scheduled" | "finished") : undefined,
  });

  const statusLabel: Record<StatusFilter, string> = {
    all: "Tất Cả",
    live: "Đang Diễn Ra",
    scheduled: "Sắp Diễn Ra",
    finished: "Kết Quả",
  };

  return (
    <div className="container py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter flex items-center gap-4">
          <Activity className="w-10 h-10 text-primary" />
          Trung Tâm <span className="text-primary">Trận Đấu</span>
        </h1>
        <p className="text-muted-foreground font-mono">Kết quả trực tiếp, lịch thi đấu và bảng kết quả</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            className="font-mono text-xs uppercase tracking-wider"
            onClick={() => setStatus(s)}
          >
            {s === "live" && <Radio className="w-3 h-3 mr-1.5 animate-pulse" />}
            {s === "scheduled" && <Calendar className="w-3 h-3 mr-1.5" />}
            {statusLabel[s]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : (
        <>
          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground font-mono">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Không có {statusLabel[status].toLowerCase()} nào.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
