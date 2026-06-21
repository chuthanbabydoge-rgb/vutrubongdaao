import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, Trophy, Shield, Users, Radio, Cpu, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/leagues", label: "Leagues", icon: Trophy },
    { href: "/teams", label: "Teams", icon: Shield },
    { href: "/players", label: "Players", icon: Users },
    { href: "/matches", label: "Matches", icon: Radio },
    { href: "/vr-gateway", label: "VR Gateway", icon: Cpu },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="inline-block font-mono font-bold text-xl uppercase tracking-tighter text-foreground">
              Vũ Trụ <span className="text-primary">Bóng Đá</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                   <UserIcon className="h-4 w-4"/> Dashboard
                </Link>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold uppercase tracking-wider">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-6 flex flex-col gap-4">
          {navItems.map((item) => {
             const Icon = item.icon;
             return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 text-lg font-medium",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
          <hr className="my-2 border-border" />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="h-5 w-5" />
                Dashboard
              </Link>
              <Button variant="outline" className="w-full justify-start mt-2" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
