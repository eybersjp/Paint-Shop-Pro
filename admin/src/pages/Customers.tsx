import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function Customers() {
  const { user, loading: authLoading } = useRequireAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`legal_name.ilike.%${search}%,account_code.ilike.%${search}%,trade_name.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  if (authLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers?.length ?? 0} accounts</p>
        </div>
        <Button onClick={() => navigate("/customers/new")} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Customer
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !customers?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers yet.{" "}
                    <button className="text-primary hover:underline" onClick={() => navigate("/customers/new")}>
                      Create one
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{c.account_code}</TableCell>
                    <TableCell className="font-medium">{c.legal_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{c.segment}</Badge>
                    </TableCell>
                    <TableCell>{c.default_currency}</TableCell>
                    <TableCell className="text-right">{formatMoney(c.credit_limit_minor, c.default_currency)}</TableCell>
                    <TableCell>{c.payment_terms_days}d</TableCell>
                    <TableCell>
                      {c.is_on_hold ? (
                        <Badge variant="destructive" className="text-xs">ON HOLD</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
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
