import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { User, LogOut, Trophy, Calendar, Shield } from "lucide-react";

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const displayName = user.displayName ?? user.username;

  return (
    <div className="container py-12 max-w-2xl space-y-8">
      <h1 className="text-4xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
        <User className="w-10 h-10 text-primary" /> Hồ Sơ
      </h1>

      {/* Avatar + Info */}
      <Card className="p-8 bg-card/40 border-border/40 space-y-6">
        <div className="flex items-center gap-6">
          <PlayerAvatar name={displayName} size={80} className="border-2 border-primary/30" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-mono">{displayName}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">@{user.username}</Badge>
              {user.role && <Badge variant="outline" className="font-mono flex items-center gap-1"><Shield className="w-3 h-3" />{user.role}</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Email</div>
            <div className="font-mono text-sm">{user.email}</div>
          </div>
          {user.teamId && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">ID Đội Bóng</div>
              <div className="font-mono text-sm">#{user.teamId}</div>
            </div>
          )}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Thành Viên Từ</div>
            <div className="font-mono text-sm flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6 bg-card/30 border-border/30 space-y-4">
        <h3 className="font-black font-mono uppercase tracking-tighter flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Thành Tích
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Người Tiên Phong", desc: "Đã tham gia vũ trụ", unlocked: true },
            { label: "Trinh Sát", desc: "Đã khám phá 5 giải đấu", unlocked: false },
            { label: "Nhà Phân Tích", desc: "Đã xem 20 trận đấu", unlocked: false },
            { label: "Huấn Luyện Viên", desc: "Đã gia nhập đội bóng", unlocked: !!user.teamId },
            { label: "Kỳ Cựu", desc: "Hoạt động 30 ngày", unlocked: false },
            { label: "Huyền Thoại", desc: "Đạt 100 trận đấu", unlocked: false },
          ].map(a => (
            <div key={a.label} className={`p-4 rounded-lg border text-center space-y-1 ${a.unlocked ? "border-primary/40 bg-primary/5" : "border-border/20 bg-muted/5 opacity-40"}`}>
              <Trophy className={`w-6 h-6 mx-auto ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
              <div className="font-bold font-mono text-sm">{a.label}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Logout */}
      <Button variant="outline" onClick={handleLogout} className="font-mono font-bold uppercase text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive">
        <LogOut className="w-4 h-4 mr-2" /> Đăng Xuất
      </Button>
    </div>
  );
}
