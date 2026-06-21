import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Leagues from "@/pages/leagues";
import LeagueDetail from "@/pages/league-detail";
import Teams from "@/pages/teams";
import TeamDetail from "@/pages/team-detail";
import Players from "@/pages/players";
import PlayerDetail from "@/pages/player-detail";
import Matches from "@/pages/matches";
import MatchDetail from "@/pages/match-detail";
import VRGateway from "@/pages/vr-gateway";
import VRStadium from "@/pages/vr-stadium";
import Profile from "@/pages/profile";
import PlaySetup from "@/pages/play-setup";
import Play from "@/pages/play";
import MatchEngine from "@/pages/match-engine";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leagues" component={Leagues} />
        <Route path="/leagues/:id" component={LeagueDetail} />
        <Route path="/teams" component={Teams} />
        <Route path="/teams/:id" component={TeamDetail} />
        <Route path="/players" component={Players} />
        <Route path="/players/:id" component={PlayerDetail} />
        <Route path="/matches" component={Matches} />
        <Route path="/matches/:id" component={MatchDetail} />
        <Route path="/vr-gateway" component={VRGateway} />
        <Route path="/vr-stadium" component={VRStadium} />
        <Route path="/profile" component={Profile} />
        <Route path="/play/setup" component={PlaySetup} />
        <Route path="/play" component={Play} />
        <Route path="/match-engine" component={MatchEngine} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
