import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { QuoteLineItem } from "@/types/domain";

export default function QuoteNew() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(15);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Product search for adding lines
  const [productSearch, setProductSearch] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers-select"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, legal_name, account_code, default_currency").eq("is_on_hold", false).order("legal_name");
      return data ?? [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products-search", productSearch],
    enabled: !!user && productSearch.length > 1,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, sku, name")
        .eq("is_saleable", true)
        .eq("is_active", true)
        .or(`name.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`)
        .limit(10);
      return data ?? [];
    },
  });

  const addLine = (product: { id: string; sku: string; name: string }) => {
    if (lineItems.find((l) => l.product_id === product.id)) {
      toast.error("Product already added");
      return;
    }
    setLineItems([
      ...lineItems,
      { product_id: product.id, sku: product.sku, name: product.name, quantity: 1, unit_price_minor: 0, line_total_minor: 0 },
    ]);
    setProductSearch("");
  };

  const updateLine = (idx: number, field: "quantity" | "unit_price_minor", value: number) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    updated[idx].line_total_minor = Math.round(updated[idx].quantity * updated[idx].unit_price_minor);
    setLineItems(updated);
  };

  const removeLine = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const subtotal = lineItems.reduce((s, l) => s + l.line_total_minor, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax;

  const handleCustomerChange = (val: string) => {
    setCustomerId(val);
    const cust = customers?.find((c: any) => c.id === val);
    if (cust) setCurrency(cust.default_currency);
  };

  const handleSubmit = async () => {
    if (!customerId) { toast.error("Select a customer"); return; }
    if (!lineItems.length) { toast.error("Add at least one line item"); return; }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("quotations")
      .insert({
        customer_id: customerId,
        currency: currency as any,
        status: "DRAFT" as any,
        line_items: lineItems as any,
        subtotal_minor: subtotal,
        tax_minor: tax,
        total_minor: total,
        tax_rate_pct: taxRate,
        notes: notes || null,
        valid_until: validUntil || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("audit_log").insert({
      entity_type: "quotation",
      entity_id: data.id,
      action: "CREATED",
      new_values: { quote_number: data.quote_number, total_minor: total } as any,
      user_id: user?.id,
    });

    toast.success(`Quote ${data.quote_number} created`);
    navigate(`/quotations/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/quotations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Quotation</h1>
          <p className="text-sm text-muted-foreground">Create a quotation for a customer</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select onValueChange={handleCustomerChange} value={customerId}>
                <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
                <SelectContent>
                  {customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.legal_name} ({c.account_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select onValueChange={setCurrency} value={currency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                    <SelectItem value="ZWG">ZWG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} min={0} max={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Totals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{(subtotal / 100).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span>{(tax / 100).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{(total / 100).toFixed(2)} {currency}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <div className="relative w-64">
              <Input
                placeholder="Search products to add..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="text-sm"
              />
              {products && products.length > 0 && productSearch.length > 1 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                  {products.map((p: any) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => addLine(p)}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                      <span className="ml-2">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="text-right w-32">Line Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!lineItems.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Search and add products above</TableCell></TableRow>
              ) : (
                lineItems.map((line, idx) => (
                  <TableRow key={line.product_id}>
                    <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                    <TableCell>{line.name}</TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(idx, "quantity", Number(e.target.value))} className="h-8 w-20" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step={1} value={line.unit_price_minor} onChange={(e) => updateLine(idx, "unit_price_minor", Number(e.target.value))} className="h-8 w-28" placeholder="cents" />
                    </TableCell>
                    <TableCell className="text-right">{(line.line_total_minor / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating..." : "Create Quote"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/quotations")}>Cancel</Button>
      </div>
    </div>
  );
}
