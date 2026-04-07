import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ArrowLeft, Edit, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").eq("customer_id", id!);
      return data ?? [];
    },
  });

  const toggleHold = async () => {
    if (!customer) return;
    const { error } = await supabase
      .from("customers")
      .update({ is_on_hold: !customer.is_on_hold })
      .eq("id", customer.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.from("audit_log").insert({
      entity_type: "customer",
      entity_id: customer.id,
      action: customer.is_on_hold ? "HOLD_REMOVED" : "PLACED_ON_HOLD",
      user_id: user?.id,
    });

    toast.success(customer.is_on_hold ? "Hold removed" : "Customer placed on hold");
    queryClient.invalidateQueries({ queryKey: ["customer", id] });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!customer) return <div className="text-center py-8 text-muted-foreground">Customer not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{customer.legal_name}</h1>
              {customer.is_on_hold ? (
                <Badge variant="destructive">ON HOLD</Badge>
              ) : (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{customer.account_code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleHold}>
            {customer.is_on_hold ? <CheckCircle className="h-4 w-4 mr-1" /> : <Ban className="h-4 w-4 mr-1" />}
            {customer.is_on_hold ? "Remove Hold" : "Place on Hold"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.trade_name && <div><span className="text-muted-foreground">Trade Name:</span> {customer.trade_name}</div>}
            <div><span className="text-muted-foreground">Segment:</span> <Badge variant="outline">{customer.segment}</Badge></div>
            <div><span className="text-muted-foreground">Currency:</span> {customer.default_currency}</div>
            <div><span className="text-muted-foreground">Credit Limit:</span> {formatMoney(customer.credit_limit_minor, customer.default_currency as any)}</div>
            <div><span className="text-muted-foreground">Payment Terms:</span> {customer.payment_terms_days} days</div>
            <div><span className="text-muted-foreground">Created:</span> {formatDate(customer.created_at)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Contacts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!contacts?.length ? (
              <p className="text-sm text-muted-foreground">No contacts added yet.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((c: any) => (
                  <div key={c.id} className="text-sm border-b last:border-0 pb-2">
                    <p className="font-medium">{c.full_name}</p>
                    {c.role && <p className="text-muted-foreground">{c.role}</p>}
                    {c.email && <p className="text-muted-foreground">{c.email}</p>}
                    {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
