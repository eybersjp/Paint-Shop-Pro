import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/format";

export default function SalesOrders() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["sales-orders"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select("*, customers(legal_name, account_code)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} orders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Credit Check</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : !orders?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No sales orders yet. Convert an approved quote to create one.
                </TableCell></TableRow>
              ) : (
                orders.map((o: any) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/sales-orders/${o.id}`)}>
                    <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                    <TableCell className="font-medium">{o.customers?.legal_name}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell>{o.currency}</TableCell>
                    <TableCell className="text-right">{formatMoney(o.total_minor, o.currency)}</TableCell>
                    <TableCell>
                      {o.credit_check_passed ? (
                        <span className="text-xs text-[hsl(var(--success))]">✓ Passed</span>
                      ) : o.credit_check_passed === false ? (
                        <span className="text-xs text-destructive">✗ Failed</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(o.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
