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
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const schema = z.object({
  sku: z.string().min(1, "Required").max(50),
  name: z.string().min(1, "Required").max(255),
  brand: z.string().min(1, "Required").max(100),
  product_kind: z.enum(["RAW_MATERIAL", "PACKAGING", "FINISHED_GOOD", "SEMI_FINISHED_GOOD", "CONSUMABLE"]),
  base_uom: z.enum(["L", "KG", "EA"]),
  pack_size: z.coerce.number().min(0).optional(),
  pack_uom: z.string().max(20).optional(),
  price_minor: z.coerce.number().min(0).optional(),
  stock_level: z.coerce.number().min(0).optional(),
  finish: z.enum(["MATT", "SHEEN", "GLOSS", "TEXTURED"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProductNew() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: "",
      name: "",
      brand: "",
      product_kind: "FINISHED_GOOD",
      base_uom: "L",
      pack_size: 1,
      pack_uom: "L",
      price_minor: 0,
      stock_level: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { data, error } = await supabase
      .from("products")
      .insert([{
        sku: values.sku,
        name: values.name,
        brand: values.brand,
        product_kind: values.product_kind,
        base_uom: values.base_uom,
        pack_size: values.pack_size || null,
        pack_uom: values.pack_uom || null,
        price_minor: values.price_minor ? Math.round(values.price_minor * 100) : null,
        stock_level: values.stock_level || 0,
        finish: values.finish || null,
        is_active: true,
      }])
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const newProduct = data as Product;

    // Audit log
    await supabase.from("audit_log").insert({
      entity_type: "product",
      entity_id: newProduct.id,
      action: "CREATED",
      new_values: newProduct,
      user_id: user?.id,
    });

    toast.success("Product created");
    navigate(`/products`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Product</h1>
          <p className="text-sm text-muted-foreground">Add a new item to the inventory</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl><Input placeholder="ABC-123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl><Input placeholder="High Gloss White" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl><Input placeholder="PaintFlow" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
                          <SelectItem value="SEMI_FINISHED_GOOD">Semi-Finished Good</SelectItem>
                          <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                          <SelectItem value="PACKAGING">Packaging</SelectItem>
                          <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="base_uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base UOM</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="L">Liters (L)</SelectItem>
                          <SelectItem value="KG">Kilograms (KG)</SelectItem>
                          <SelectItem value="EA">Each (EA)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finish</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select finish" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="MATT">Matt</SelectItem>
                          <SelectItem value="SHEEN">Sheen</SelectItem>
                          <SelectItem value="GLOSS">Gloss</SelectItem>
                          <SelectItem value="TEXTURED">Textured</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_minor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (ZAR)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pack_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack Size</FormLabel>
                      <FormControl><Input type="number" step="0.1" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pack_uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack UOM</FormLabel>
                      <FormControl><Input placeholder="L, KG, etc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock Level</FormLabel>
                      <FormControl><Input type="number" step="1" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Adding..." : "Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/products")}>
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
