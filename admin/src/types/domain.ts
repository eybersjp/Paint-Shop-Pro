export type CurrencyCode = "USD" | "ZAR" | "ZWG";
export type CustomerSegment = "DEALER" | "CONTRACTOR" | "PROJECT" | "RETAIL" | "GOVERNMENT";
export type ProductKind = "RAW_MATERIAL" | "PACKAGING" | "FINISHED_GOOD" | "SEMI_FINISHED_GOOD" | "CONSUMABLE";
export type ProductFinish = "MATT" | "SHEEN" | "GLOSS" | "TEXTURED";
export type Uom = "L" | "KG" | "EA";
export type QuoteStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CONVERTED" | "EXPIRED";
export type SalesOrderStatus = "CONFIRMED" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";
export type AppRole = "admin" | "sales" | "finance" | "viewer";

export interface QuoteLineItem {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
}
