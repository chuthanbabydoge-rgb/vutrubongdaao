import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Rocket } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  displayName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", displayName: "" },
  });

  const registerMutation = useRegisterUser();

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data }, {
      onSuccess: (response) => {
        login(response.token);
        toast({ title: "Chào mừng đến Vũ Trụ!", description: "Sự nghiệp của bạn đã bắt đầu. Chọn đội bóng của bạn." });
        setLocation("/dashboard");
      },
      onError: (error: Error) => {
        toast({ title: "Đăng ký thất bại", description: error.message || "Vui lòng thử lại.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="container max-w-md mx-auto py-24">
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black font-mono tracking-tighter uppercase">
            BẮT ĐẦU <span className="text-primary">SỰ NGHIỆP</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-mono">
            Tạo tài khoản và bước vào vũ trụ bóng đá ảo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Tên Hiển Thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Ronaldo Jr." {...field} className="bg-background/50 h-12 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Tên Đăng Nhập <span className="text-primary">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="striker99" {...field} className="bg-background/50 h-12 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Email <span className="text-primary">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="cauThu@vtbda.com" {...field} className="bg-background/50 h-12 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono uppercase text-xs font-bold text-muted-foreground tracking-wider">Mật Khẩu <span className="text-primary">*</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 h-12 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-12 font-mono font-bold uppercase tracking-wider" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bắt Đầu Ngay"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/20 pt-6 text-center">
          <div className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">Đăng nhập tại đây</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
