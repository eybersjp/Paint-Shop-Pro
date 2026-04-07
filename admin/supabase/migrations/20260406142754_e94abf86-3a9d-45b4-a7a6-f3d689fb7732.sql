
-- Enums
CREATE TYPE public.customer_segment AS ENUM ('DEALER', 'CONTRACTOR', 'PROJECT', 'RETAIL', 'GOVERNMENT');
CREATE TYPE public.currency_code AS ENUM ('USD', 'ZAR', 'ZWG');
CREATE TYPE public.product_kind AS ENUM ('RAW_MATERIAL', 'PACKAGING', 'FINISHED_GOOD', 'SEMI_FINISHED_GOOD', 'CONSUMABLE');
CREATE TYPE public.product_finish AS ENUM ('MATT', 'SHEEN', 'GLOSS', 'TEXTURED');
CREATE TYPE public.uom AS ENUM ('L', 'KG', 'EA');
CREATE TYPE public.quote_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED', 'EXPIRED');
CREATE TYPE public.sales_order_status AS ENUM ('CONFIRMED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');
CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'finance', 'viewer');

-- Utility: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin-only role management
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Customers
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  segment public.customer_segment NOT NULL DEFAULT 'RETAIL',
  credit_limit_minor BIGINT NOT NULL DEFAULT 0,
  payment_terms_days INT NOT NULL DEFAULT 30,
  default_currency public.currency_code NOT NULL DEFAULT 'USD',
  is_on_hold BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contacts
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  product_kind public.product_kind NOT NULL DEFAULT 'FINISHED_GOOD',
  base_uom public.uom NOT NULL DEFAULT 'L',
  brand TEXT NOT NULL DEFAULT '',
  finish public.product_finish,
  color_code TEXT,
  pack_size NUMERIC,
  pack_uom TEXT,
  is_batch_tracked BOOLEAN NOT NULL DEFAULT true,
  is_formula_controlled BOOLEAN NOT NULL DEFAULT false,
  is_saleable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Price Lists
CREATE TABLE public.price_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'USD',
  valid_from DATE,
  valid_to DATE,
  segment public.customer_segment,
  customer_id UUID REFERENCES public.customers(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view price_lists" ON public.price_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage price_lists" ON public.price_lists FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_price_lists_updated_at BEFORE UPDATE ON public.price_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Price List Items
CREATE TABLE public.price_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  unit_price_minor BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (price_list_id, product_id)
);
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view price_list_items" ON public.price_list_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage price_list_items" ON public.price_list_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_price_list_items_updated_at BEFORE UPDATE ON public.price_list_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quote number sequence
CREATE SEQUENCE public.quote_number_seq START 1000;

-- Quotations
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE DEFAULT 'QT-' || LPAD(nextval('public.quote_number_seq')::TEXT, 6, '0'),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  currency public.currency_code NOT NULL DEFAULT 'USD',
  status public.quote_status NOT NULL DEFAULT 'DRAFT',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_minor BIGINT NOT NULL DEFAULT 0,
  tax_minor BIGINT NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL DEFAULT 0,
  tax_rate_pct NUMERIC NOT NULL DEFAULT 15,
  notes TEXT,
  valid_until DATE,
  pricing_snapshot JSONB,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create quotations" ON public.quotations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update quotations" ON public.quotations FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sales order number sequence
CREATE SEQUENCE public.order_number_seq START 1000;

-- Sales Orders
CREATE TABLE public.sales_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'SO-' || LPAD(nextval('public.order_number_seq')::TEXT, 6, '0'),
  quotation_id UUID UNIQUE REFERENCES public.quotations(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  currency public.currency_code NOT NULL DEFAULT 'USD',
  status public.sales_order_status NOT NULL DEFAULT 'CONFIRMED',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_minor BIGINT NOT NULL DEFAULT 0,
  tax_minor BIGINT NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL DEFAULT 0,
  tax_rate_pct NUMERIC NOT NULL DEFAULT 15,
  credit_check_passed BOOLEAN,
  credit_check_details JSONB,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view sales_orders" ON public.sales_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create sales_orders" ON public.sales_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update sales_orders" ON public.sales_orders FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON public.sales_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit Log
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view audit_log" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_customers_segment ON public.customers(segment);
CREATE INDEX idx_customers_account_code ON public.customers(account_code);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX idx_sales_orders_customer ON public.sales_orders(customer_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_kind ON public.products(product_kind);
