import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/format";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function Quotations() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: quotations, isLoading } = useQuery({
    queryKey: ["quotations", search],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("quotations")
        .select("*, customers(legal_name, account_code)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`quote_number.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-sm text-muted-foreground">{quotations?.length ?? 0} quotes</p>
        </div>
        <Button onClick={() => navigate("/quotations/new")} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Quote
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : !quotations?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No quotations yet.{" "}
                  <button className="text-primary hover:underline" onClick={() => navigate("/quotations/new")}>Create one</button>
                </TableCell></TableRow>
              ) : (
                quotations.map((q: any) => (
                  <TableRow key={q.id} className="cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>
                    <TableCell className="font-mono text-xs">{q.quote_number}</TableCell>
                    <TableCell className="font-medium">{q.customers?.legal_name}</TableCell>
                    <TableCell><StatusBadge status={q.status} /></TableCell>
                    <TableCell>{q.currency}</TableCell>
                    <TableCell className="text-right">{formatMoney(q.total_minor, q.currency)}</TableCell>
                    <TableCell>{formatDate(q.valid_until)}</TableCell>
                    <TableCell>{formatDate(q.created_at)}</TableCell>
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
