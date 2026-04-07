import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Products() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("name");
      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products?.length ?? 0} products</p>
        </div>
        <Button onClick={() => navigate("/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Finish</TableHead>
                <TableHead>Pack</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !products?.length ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {product.product_kind}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.finish ?? "—"}</TableCell>
                    <TableCell>
                      {product.pack_size ? `${product.pack_size}${product.pack_uom ?? ""}` : "—"}
                    </TableCell>
                    <TableCell>{product.base_uom}</TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={(product.stock_level ?? 0) < 10 ? "text-destructive font-bold" : ""}>
                        {product.stock_level ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {product.price_minor ? `$${(product.price_minor / 100).toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
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
