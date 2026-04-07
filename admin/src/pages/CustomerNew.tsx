import { useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  legal_name: z.string().min(1, "Required").max(255),
  trade_name: z.string().max(255).optional(),
  segment: z.enum(["DEALER", "CONTRACTOR", "PROJECT", "RETAIL", "GOVERNMENT"]),
  credit_limit_minor: z.coerce.number().min(0),
  payment_terms_days: z.coerce.number().min(0).max(365),
  default_currency: z.enum(["USD", "ZAR", "ZWG"]),
});

type FormValues = z.infer<typeof schema>;

export default function CustomerNew() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      legal_name: "",
      trade_name: "",
      segment: "RETAIL",
      credit_limit_minor: 0,
      payment_terms_days: 30,
      default_currency: "USD",
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Generate account code
    const prefix = values.segment.slice(0, 3);
    const rand = Math.floor(Math.random() * 90000 + 10000);
    const account_code = `CUST-${prefix}-${rand}`;

    const { data, error } = await supabase
      .from("customers")
      .insert([{
        legal_name: values.legal_name,
        trade_name: values.trade_name || null,
        segment: values.segment as any,
        default_currency: values.default_currency as any,
        payment_terms_days: values.payment_terms_days,
        account_code,
        credit_limit_minor: Math.round(values.credit_limit_minor * 100),
      }])
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // Audit log
    await supabase.from("audit_log").insert({
      entity_type: "customer",
      entity_id: data.id,
      action: "CREATED",
      new_values: data as any,
      user_id: user?.id,
    });

    toast.success("Customer created");
    navigate(`/customers/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Customer</h1>
          <p className="text-sm text-muted-foreground">Create a new customer account</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Name *</FormLabel>
                    <FormControl><Input placeholder="Company Pty Ltd" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trade_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Name</FormLabel>
                    <FormControl><Input placeholder="Optional trading name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="DEALER">Dealer</SelectItem>
                          <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          <SelectItem value="PROJECT">Project</SelectItem>
                          <SelectItem value="RETAIL">Retail</SelectItem>
                          <SelectItem value="GOVERNMENT">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                          <SelectItem value="ZWG">ZWG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="credit_limit_minor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit (major units)</FormLabel>
                      <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_terms_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms (days)</FormLabel>
                      <FormControl><Input type="number" min="0" max="365" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating..." : "Create Customer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/customers")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
