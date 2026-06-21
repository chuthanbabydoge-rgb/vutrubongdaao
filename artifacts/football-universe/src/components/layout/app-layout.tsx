import { MainNav } from "./main-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <MainNav />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 md:py-12 bg-card">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-mono font-bold text-xl tracking-tighter">
              VŨ TRỤ <span className="text-primary">BÓNG ĐÁ</span>
            </span>
            <p className="text-sm text-muted-foreground">
              Nền tảng mô phỏng bóng đá ảo đỉnh cao.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VTBDA. Bảo lưu mọi quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
