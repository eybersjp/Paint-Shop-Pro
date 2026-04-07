import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerNew from "./pages/CustomerNew";
import CustomerDetail from "./pages/CustomerDetail";
import Quotations from "./pages/Quotations";
import QuoteNew from "./pages/QuoteNew";
import QuoteDetail from "./pages/QuoteDetail";
import SalesOrders from "./pages/SalesOrders";
import SalesOrderDetail from "./pages/SalesOrderDetail";
import Products from "./pages/Products";
import ProductNew from "./pages/ProductNew";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerNew />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/new" element={<QuoteNew />} />
            <Route path="/quotations/:id" element={<QuoteDetail />} />
            <Route path="/sales-orders" element={<SalesOrders />} />
            <Route path="/sales-orders/:id" element={<SalesOrderDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductNew />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
