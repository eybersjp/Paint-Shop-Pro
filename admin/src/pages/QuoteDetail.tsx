import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { ArrowLeft, CheckCircle, XCircle, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";
import type { QuoteLineItem } from "@/types/domain";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quotation", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*, customers(legal_name, account_code, credit_limit_minor, is_on_hold, default_currency)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleApprove = async () => {
    if (!quote) return;
    const { error } = await supabase
      .from("quotations")
      .update({
        status: "APPROVED" as any,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        pricing_snapshot: quote.line_items,
      })
      .eq("id", quote.id)
      .eq("status", "SUBMITTED");

    if (error) { toast.error(error.message); return; }

    await supabase.from("audit_log").insert({
      entity_type: "quotation", entity_id: quote.id, action: "APPROVED", user_id: user?.id,
    });

    toast.success("Quote approved");
    qc.invalidateQueries({ queryKey: ["quotation", id] });
  };

  const handleReject = async () => {
    if (!quote) return;
    const { error } = await supabase
      .from("quotations")
      .update({ status: "REJECTED" as any })
      .eq("id", quote.id)
      .in("status", ["SUBMITTED", "DRAFT"]);

    if (error) { toast.error(error.message); return; }

    await supabase.from("audit_log").insert({
      entity_type: "quotation", entity_id: quote.id, action: "REJECTED", user_id: user?.id,
    });

    toast.success("Quote rejected");
    qc.invalidateQueries({ queryKey: ["quotation", id] });
  };

  const handleSubmit = async () => {
    if (!quote) return;
    const { error } = await supabase
      .from("quotations")
      .update({ status: "SUBMITTED" as any })
      .eq("id", quote.id)
      .eq("status", "DRAFT");

    if (error) { toast.error(error.message); return; }

    await supabase.from("audit_log").insert({
      entity_type: "quotation", entity_id: quote.id, action: "SUBMITTED", user_id: user?.id,
    });

    toast.success("Quote submitted for approval");
    qc.invalidateQueries({ queryKey: ["quotation", id] });
  };

  const handleConvert = async () => {
    if (!quote) return;
    const customer = quote.customers as any;

    // Credit check
    if (customer?.is_on_hold) {
      toast.error("Customer is on hold. Cannot create sales order.");
      return;
    }

    // Idempotency: check if SO already exists for this quote
    const { data: existingOrder } = await supabase
      .from("sales_orders")
      .select("id, order_number")
      .eq("quotation_id", quote.id)
      .maybeSingle();

    if (existingOrder) {
      toast.info(`Order ${existingOrder.order_number} already exists for this quote`);
      navigate(`/sales-orders/${existingOrder.id}`);
      return;
    }

    const creditCheckPassed = customer ? Number(quote.total_minor) <= Number(customer.credit_limit_minor) : true;

    const { data: order, error } = await supabase
      .from("sales_orders")
      .insert({
        quotation_id: quote.id,
        customer_id: quote.customer_id,
        currency: quote.currency,
        status: "CONFIRMED" as any,
        line_items: quote.pricing_snapshot ?? quote.line_items,
        subtotal_minor: quote.subtotal_minor,
        tax_minor: quote.tax_minor,
        total_minor: quote.total_minor,
        tax_rate_pct: quote.tax_rate_pct,
        credit_check_passed: creditCheckPassed,
        credit_check_details: { credit_limit: customer?.credit_limit_minor, order_total: quote.total_minor } as any,
        confirmed_by: user?.id,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }

    // Mark quote as converted
    await supabase.from("quotations").update({ status: "CONVERTED" as any }).eq("id", quote.id);

    await supabase.from("audit_log").insert({
      entity_type: "quotation", entity_id: quote.id, action: "CONVERTED_TO_ORDER",
      new_values: { sales_order_id: order.id, order_number: order.order_number } as any,
      user_id: user?.id,
    });

    toast.success(`Sales Order ${order.order_number} created`);
    navigate(`/sales-orders/${order.id}`);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!quote) return <div className="text-center py-8 text-muted-foreground">Quote not found</div>;

  const lines = (quote.line_items as any as QuoteLineItem[]) ?? [];
  const customer = quote.customers as any;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quotations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{quote.quote_number}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="text-sm text-muted-foreground">{customer?.legal_name} • {customer?.account_code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {quote.status === "DRAFT" && (
            <Button variant="outline" size="sm" onClick={handleSubmit}>Submit for Approval</Button>
          )}
          {quote.status === "SUBMITTED" && (
            <>
              <Button variant="outline" size="sm" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
            </>
          )}
          {quote.status === "APPROVED" && (
            <Button size="sm" onClick={handleConvert}>
              <ArrowRightCircle className="h-4 w-4 mr-1" /> Convert to Sales Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Currency:</span> {quote.currency}</div>
            <div><span className="text-muted-foreground">Tax Rate:</span> {quote.tax_rate_pct}%</div>
            <div><span className="text-muted-foreground">Valid Until:</span> {formatDate(quote.valid_until)}</div>
            <div><span className="text-muted-foreground">Created:</span> {formatDateTime(quote.created_at)}</div>
            {quote.approved_at && <div><span className="text-muted-foreground">Approved:</span> {formatDateTime(quote.approved_at)}</div>}
            {quote.notes && <div><span className="text-muted-foreground">Notes:</span> {quote.notes}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Totals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(quote.subtotal_minor, quote.currency as any)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({quote.tax_rate_pct}%)</span><span>{formatMoney(quote.tax_minor, quote.currency as any)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatMoney(quote.total_minor, quote.currency as any)}</span></div>
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
                  <TableCell className="text-right">{formatMoney(line.unit_price_minor, quote.currency as any)}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.line_total_minor, quote.currency as any)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
