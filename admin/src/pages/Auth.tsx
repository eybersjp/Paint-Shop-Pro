import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email for a verification link");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-lg border-0 shadow-2xl shadow-black/10 rounded-[3rem] overflow-hidden p-2">
        <div className="bg-card rounded-[2.5rem] p-10 space-y-10">
          <CardHeader className="text-center p-0 space-y-6">
            <div className="mx-auto h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 transform transition-transform hover:rotate-6 active:scale-95">
              <span className="text-primary-foreground font-display font-bold text-2xl">P</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
                PaintShop <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 font-bold">Architectural Color Systems</p>
            </div>
            <CardDescription className="text-base font-medium text-muted-foreground/80 pt-4">
              {isLogin ? "Precision operational intelligence awaits." : "Join the professional network of paint manufacturing."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-4">Full Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    required={!isLogin}
                    className="h-14 rounded-2xl bg-muted/40 border-0 ring-1 ring-black/[0.03] focus-visible:ring-primary/20 px-6 font-medium"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-4">Corporate Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="h-14 rounded-2xl bg-muted/40 border-0 ring-1 ring-black/[0.03] focus-visible:ring-primary/20 px-6 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-4">Secure Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-14 rounded-2xl bg-muted/40 border-0 ring-1 ring-black/[0.03] focus-visible:ring-primary/20 px-6 font-medium"
                />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl text-base shadow-2xl shadow-primary/20" disabled={loading}>
                {loading ? "Authenticating..." : isLogin ? "Access System" : "Initialize Account"}
              </Button>
            </form>

            <div className="mt-10 text-center text-sm font-medium text-muted-foreground/60">
              {isLogin ? "New to the system?" : "Already possess an account?"}{" "}
              <button
                type="button"
                className="text-primary hover:underline font-bold transition-all hover:tracking-wide ml-1"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Join the Network" : "Return to Access"}
              </button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
