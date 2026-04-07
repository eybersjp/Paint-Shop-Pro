export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_code: string
          created_at: string
          credit_limit_minor: number
          default_currency: Database["public"]["Enums"]["currency_code"]
          id: string
          is_on_hold: boolean
          legal_name: string
          payment_terms_days: number
          segment: Database["public"]["Enums"]["customer_segment"]
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          created_at?: string
          credit_limit_minor?: number
          default_currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_on_hold?: boolean
          legal_name: string
          payment_terms_days?: number
          segment?: Database["public"]["Enums"]["customer_segment"]
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          created_at?: string
          credit_limit_minor?: number
          default_currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_on_hold?: boolean
          legal_name?: string
          payment_terms_days?: number
          segment?: Database["public"]["Enums"]["customer_segment"]
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      price_list_items: {
        Row: {
          created_at: string
          id: string
          price_list_id: string
          product_id: string
          unit_price_minor: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_list_id: string
          product_id: string
          unit_price_minor?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price_list_id?: string
          product_id?: string
          unit_price_minor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          customer_id: string | null
          id: string
          is_active: boolean
          name: string
          segment: Database["public"]["Enums"]["customer_segment"] | null
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_uom: Database["public"]["Enums"]["uom"]
          brand: string
          color_code: string | null
          created_at: string
          finish: Database["public"]["Enums"]["product_finish"] | null
          id: string
          is_active: boolean
          is_batch_tracked: boolean
          is_saleable: boolean
          name: string
          pack_size: number | null
          pack_uom: string | null
          price_minor: number | null
          product_kind: Database["public"]["Enums"]["product_kind"]
          sku: string
          stock_level: number | null
          updated_at: string
        }
        Insert: {
          base_uom?: Database["public"]["Enums"]["uom"]
          brand?: string
          color_code?: string | null
          created_at?: string
          finish?: Database["public"]["Enums"]["product_finish"] | null
          id?: string
          is_active?: boolean
          is_batch_tracked?: boolean
          is_formula_controlled?: boolean
          is_saleable?: boolean
          name: string
          pack_size?: number | null
          pack_uom?: string | null
          price_minor?: number | null
          product_kind?: Database["public"]["Enums"]["product_kind"]
          sku: string
          stock_level?: number | null
          updated_at?: string
        }
        Update: {
          base_uom?: Database["public"]["Enums"]["uom"]
          brand?: string
          color_code?: string | null
          created_at?: string
          finish?: Database["public"]["Enums"]["product_finish"] | null
          id?: string
          is_active?: boolean
          is_batch_tracked?: boolean
          is_formula_controlled?: boolean
          is_saleable?: boolean
          name?: string
          pack_size?: number | null
          pack_uom?: string | null
          price_minor?: number | null
          product_kind?: Database["public"]["Enums"]["product_kind"]
          sku?: string
          stock_level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          customer_id: string
          id: string
          line_items: Json
          notes: string | null
          pricing_snapshot: Json | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal_minor: number
          tax_minor: number
          tax_rate_pct: number
          total_minor: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id: string
          id?: string
          line_items?: Json
          notes?: string | null
          pricing_snapshot?: Json | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal_minor?: number
          tax_minor?: number
          tax_rate_pct?: number
          total_minor?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id?: string
          id?: string
          line_items?: Json
          notes?: string | null
          pricing_snapshot?: Json | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal_minor?: number
          tax_minor?: number
          tax_rate_pct?: number
          total_minor?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          credit_check_details: Json | null
          credit_check_passed: boolean | null
          currency: Database["public"]["Enums"]["currency_code"]
          customer_id: string
          id: string
          line_items: Json
          order_number: string
          quotation_id: string | null
          status: Database["public"]["Enums"]["sales_order_status"]
          subtotal_minor: number
          tax_minor: number
          tax_rate_pct: number
          total_minor: number
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          credit_check_details?: Json | null
          credit_check_passed?: boolean | null
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id: string
          id?: string
          line_items?: Json
          order_number?: string
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["sales_order_status"]
          subtotal_minor?: number
          tax_minor?: number
          tax_rate_pct?: number
          total_minor?: number
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          credit_check_details?: Json | null
          credit_check_passed?: boolean | null
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_id?: string
          id?: string
          line_items?: Json
          order_number?: string
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["sales_order_status"]
          subtotal_minor?: number
          tax_minor?: number
          tax_rate_pct?: number
          total_minor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: true
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "sales" | "finance" | "viewer"
      currency_code: "USD" | "ZAR" | "ZWG"
      customer_segment:
        | "DEALER"
        | "CONTRACTOR"
        | "PROJECT"
        | "RETAIL"
        | "GOVERNMENT"
      product_finish: "MATT" | "SHEEN" | "GLOSS" | "TEXTURED"
      product_kind:
        | "RAW_MATERIAL"
        | "PACKAGING"
        | "FINISHED_GOOD"
        | "SEMI_FINISHED_GOOD"
        | "CONSUMABLE"
      quote_status:
        | "DRAFT"
        | "SUBMITTED"
        | "APPROVED"
        | "REJECTED"
        | "CONVERTED"
        | "EXPIRED"
      sales_order_status:
        | "CONFIRMED"
        | "PARTIALLY_FULFILLED"
        | "FULFILLED"
        | "CANCELLED"
      uom: "L" | "KG" | "EA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sales", "finance", "viewer"],
      currency_code: ["USD", "ZAR", "ZWG"],
      customer_segment: [
        "DEALER",
        "CONTRACTOR",
        "PROJECT",
        "RETAIL",
        "GOVERNMENT",
      ],
      product_finish: ["MATT", "SHEEN", "GLOSS", "TEXTURED"],
      product_kind: [
        "RAW_MATERIAL",
        "PACKAGING",
        "FINISHED_GOOD",
        "SEMI_FINISHED_GOOD",
        "CONSUMABLE",
      ],
      quote_status: [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "CONVERTED",
        "EXPIRED",
      ],
      sales_order_status: [
        "CONFIRMED",
        "PARTIALLY_FULFILLED",
        "FULFILLED",
        "CANCELLED",
      ],
      uom: ["L", "KG", "EA"],
    },
  },
} as const
