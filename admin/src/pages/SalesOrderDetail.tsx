import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import type { QuoteLineItem } from "@/types/domain";

export default function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["sales-order", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select("*, customers(legal_name, account_code, credit_limit_minor, default_currency)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!order) return <div className="text-center py-8 text-muted-foreground">Order not found</div>;

  const lines = (order.line_items as any as QuoteLineItem[]) ?? [];
  const customer = order.customers as any;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sales-orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">{customer?.legal_name} • {customer?.account_code}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Currency:</span> {order.currency}</div>
            <div><span className="text-muted-foreground">Tax Rate:</span> {order.tax_rate_pct}%</div>
            <div><span className="text-muted-foreground">Confirmed:</span> {formatDateTime(order.confirmed_at)}</div>
            <div>
              <span className="text-muted-foreground">Credit Check:</span>{" "}
              {order.credit_check_passed ? (
                <span className="text-[hsl(var(--success))]">Passed</span>
              ) : (
                <span className="text-destructive">Failed / Warning</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Totals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(order.subtotal_minor, order.currency as any)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({order.tax_rate_pct}%)</span><span>{formatMoney(order.tax_minor, order.currency as any)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatMoney(order.total_minor, order.currency as any)}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                  <TableCell>{line.name}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.unit_price_minor, order.currency as any)}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.line_total_minor, order.currency as any)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
