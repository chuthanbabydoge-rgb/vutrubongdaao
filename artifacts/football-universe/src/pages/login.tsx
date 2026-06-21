import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginUser();

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        login(response.token);
        toast({
          title: "Login successful",
          description: "Welcome back to the Virtual Football Universe.",
        });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container max-w-md mx-auto py-24">
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-black font-mono tracking-tighter uppercase">MISSION <span className="text-primary">LOGIN</span></CardTitle>
          <CardDescription className="text-muted-foreground font-mono">
            Enter your credentials to access the cosmic pitch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="commander@vtbda.com" {...field} className="bg-background/50 h-12 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 h-12 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 font-mono font-bold uppercase tracking-wider" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/20 pt-6 text-center">
          <div className="text-sm text-muted-foreground">
            New to the universe?{" "}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Register now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
