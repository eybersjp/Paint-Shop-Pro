import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatMoney, formatDateTime } from "@/lib/format";
import { FileText, Users, ShoppingCart, AlertTriangle, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useRequireAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: !!user,
    queryFn: async () => {
      const [quotes, approvalQuotes, todayOrders, holdCustomers, products] = await Promise.all([
        supabase
          .from("quotations")
          .select("id, total_minor, currency")
          .in("status", ["DRAFT", "SUBMITTED", "APPROVED"]),
        supabase
          .from("quotations")
          .select("id")
          .eq("status", "SUBMITTED"),
        supabase
          .from("sales_orders")
          .select("id, total_minor, currency")
          .gte("created_at", new Date().toISOString().split("T")[0]),
        supabase
          .from("customers")
          .select("id")
          .eq("is_on_hold", true),
        supabase
          .from("products")
          .select("id, stock_level, price_minor")
      ]);

      const openQuoteTotal = (quotes.data ?? []).reduce((s, q) => s + Number(q.total_minor), 0);
      const todayOrderTotal = (todayOrders.data ?? []).reduce((s, o) => s + Number(o.total_minor), 0);
      const inventoryValue = (products.data ?? []).reduce((s, p) => s + (Number(p.stock_level ?? 0) * Number(p.price_minor ?? 0)), 0);

      return {
        openQuotes: quotes.data?.length ?? 0,
        openQuoteTotal,
        awaitingApproval: approvalQuotes.data?.length ?? 0,
        todayOrders: todayOrders.data?.length ?? 0,
        todayOrderTotal,
        holdCustomers: holdCustomers.data?.length ?? 0,
        inventoryValue,
        totalProducts: products.data?.length ?? 0,
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recent-activity"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  if (authLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const kpis = [
    {
      title: "Open Quotes",
      value: stats?.openQuotes ?? 0,
      subtitle: formatMoney(stats?.openQuoteTotal ?? 0),
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Awaiting Approval",
      value: stats?.awaitingApproval ?? 0,
      subtitle: "quotes pending",
      icon: FileText,
      color: "text-[hsl(var(--warning))]",
    },
    {
      title: "Orders Today",
      value: stats?.todayOrders ?? 0,
      subtitle: formatMoney(stats?.todayOrderTotal ?? 0),
      icon: ShoppingCart,
      color: "text-[hsl(var(--success))]",
    },
    {
      title: "Inventory Value",
      value: stats?.totalProducts ?? 0,
      subtitle: formatMoney(stats?.inventoryValue ?? 0),
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "Accounts On Hold",
      value: stats?.holdCustomers ?? 0,
      subtitle: "require attention",
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Operational Intelligence</h2>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.8]">
            PaintShop <span className="text-primary italic">Pro</span>
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-md font-medium leading-relaxed">
            Architectural precision in manufacturing. Your system is performing at <span className="text-success font-bold">100% capacity</span>.
          </p>
        </div>
        <div className="flex gap-3 pb-2">
          <Button onClick={() => navigate("/customers/new")} variant="secondary" className="rounded-xl px-6 h-12 font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <Plus className="h-4 w-4 mr-2" /> New Customer
          </Button>
          <Button onClick={() => navigate("/quotations/new")} className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1">
            <Plus className="h-4 w-4 mr-2" /> Create Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, i) => (
          <div 
            key={kpi.title} 
            className="group relative overflow-hidden rounded-[2.5rem] bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <kpi.icon className="h-24 w-24" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-8">{kpi.title}</p>
            <div className="space-y-1">
              <div className="text-5xl font-display font-bold tracking-tighter">{kpi.value}</div>
              <p className="text-sm font-semibold text-muted-foreground tracking-tight">{kpi.subtitle}</p>
            </div>
            <div className={`mt-8 h-1.5 w-12 rounded-full ${kpi.color.replace('text-', 'bg-')}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[3rem] bg-card/40 backdrop-blur-sm p-10 relative overflow-hidden ring-1 ring-black/[0.03]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-bold tracking-tight">System Audit Log</h3>
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {!recentActivity?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground/60 font-medium max-w-[200px]">No recent operational activity detected.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((entry: any, i: number) => (
                <div 
                  key={entry.id} 
                  className="flex items-center gap-6 group cursor-default"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/5">
                    <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  </div>
                  <div className="flex-1 border-b border-muted/50 pb-6 group-last:border-0 group-last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground/90 group-hover:text-primary transition-colors">
                        {entry.action} <span className="text-muted-foreground/40 font-medium mx-1">//</span> {entry.entity_type}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[3rem] bg-primary p-10 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">Pro Direct</h3>
              <p className="text-primary-foreground/70 text-sm font-medium leading-relaxed italic">
                "Precision is not just a metric, it's our architectural signature."
              </p>
            </div>
            
            <div className="space-y-4 pt-10">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Active Sessions</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-2xl font-display font-bold">12 Users Online</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full h-14 rounded-2xl font-bold text-primary hover:bg-white transition-colors">
                Quick Action Center
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
