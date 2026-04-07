

## Paint Manufacturing CRM-ERP — Phase 1: Customer → Quote → Sales Order

### Overview
Build the commercial front-end of the paint manufacturing system: customer management, quotation workflow, and sales order confirmation — with a KPI dashboard as the landing page. All backed by Supabase (Postgres + Auth + RLS).

---

### 1. Database Schema (Supabase Migrations)

**Core tables:**
- **customers** — account code, legal/trade name, segment (DEALER/CONTRACTOR/PROJECT/RETAIL/GOVERNMENT), credit limit, payment terms, default currency (USD/ZAR/ZWG), hold status
- **contacts** — linked to customer, name, role, phone, email
- **products** — SKU, name, product kind, brand, finish, color code, pack size, UOM, saleable flag, active flag
- **price_lists** — name, currency, valid from/to, segment/customer overrides
- **price_list_items** — product, price list, unit price (minor units)
- **quotations** — quote number (auto-generated), customer, currency, status (DRAFT/SUBMITTED/APPROVED/REJECTED/CONVERTED), line items as JSONB (product, qty, unit price, line total), totals, tax, notes, valid until date, pricing snapshot locked on approval
- **sales_orders** — order number, linked quote, customer, currency, status (CONFIRMED/PARTIALLY_FULFILLED/FULFILLED/CANCELLED), line items, credit-check result, confirmed by/at
- **audit_log** — entity type, entity ID, action, previous/new values, user, timestamp

**Key constraints:**
- Quote approval freezes pricing (snapshot stored)
- Quote → Sales Order conversion is idempotent (unique constraint on quote→order link)
- Sales order confirmation checks customer credit limit and hold status

---

### 2. Authentication & Authorization
- Supabase Auth with email/password login
- User roles table (admin, sales, finance, viewer)
- RLS policies: sales users see their own customers/quotes; admins see all

---

### 3. Dashboard (Landing Page)
A clean KPI overview with:
- **Open quotes** count and total value
- **Quotes awaiting approval** count
- **Sales orders today** count and value
- **Overdue customer accounts** count
- **Quick actions**: New Quote, New Customer, View Orders
- Recent activity feed (last 10 audit log entries)

---

### 4. Customer Management
- **Customer list** — searchable/filterable table with segment, hold status, credit limit
- **Customer detail** — view/edit account info, contacts, credit terms
- **New customer form** — validated with Zod (account code auto-generated)

---

### 5. Quotation Workflow
- **Quote list** — filterable by status, customer, date range
- **Create quote** — select customer, add line items (product search, qty, price from price list with optional override), auto-calculate totals with tax
- **Quote detail** — view, edit (if DRAFT), submit for approval
- **Approve/Reject** — admin action; approval locks pricing snapshot
- **Convert to Sales Order** — idempotent; runs credit check; creates sales order with frozen pricing

---

### 6. Sales Orders
- **Order list** — filterable by status, customer, date
- **Order detail** — view line items, linked quote, customer credit status
- **Confirm order** — validates credit limit not exceeded, customer not on hold

---

### 7. UI Layout
- **Sidebar navigation**: Dashboard, Customers, Quotations, Sales Orders, Products (read-only list for now)
- **ERP-style sidebar** with collapsible groups and active route highlighting
- **Responsive** — functional on tablet for warehouse/office use
- **Consistent data tables** with sorting, search, and pagination
- **Toast notifications** for actions (quote approved, order confirmed, etc.)

---

### 8. Multicurrency Support
- All monetary values stored in minor units (cents)
- Currency displayed based on customer's default currency
- Quote and order preserve the currency at time of creation

---

### 9. Audit Trail
- Every create/update on customers, quotes, and orders logs to audit_log table
- Viewable in dashboard activity feed and per-entity history

