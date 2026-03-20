// File: /go-kirana-admin/src/lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export interface Database {
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          id: string; // uuid
          created_at: string; // timestamp with time zone
          email: string;
          user_type: string;
          status: 'pending' | 'processed' | 'error'; // Use the strict enum types
          ip_address: string | null;
        };
        Insert: {
          email: string;
          user_type: string;
          ip_address?: string | null; 
          status?: 'pending' | 'processed' | 'error'; 
        };
        Update: Partial<Database['public']['Tables']['account_deletion_requests']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          status: 'pending' | 'accepted' | 'rejected' | 'delivered';
          total_amount: number;
          slot_time: string | null;
          accepted_at: string | null;
          delivered_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      ledger: {
        Row: {
          id: string;
          store_id: string;
          amount: number;
          note: string | null;
          type: 'CREDIT' | 'DEBIT' | 'PENALTY';
          order_id: string | null;
          mode: string | null;
          created_at: string;
          removed_by_admin?: boolean;
          removed_at?: string | null;
          platform_fee?: number;
          gst?: number;
          razorpay_fee?: number;
          tcs?: number;
          customer_platform_fee?: number;
          customer_convenience_fee?: number;
        };
        Insert: {
          store_id: string;
          amount: number;
          type: 'CREDIT' | 'DEBIT' | 'PENALTY';
          note?: string | null;
          order_id?: string | null;
          mode?: string | null;
          platform_fee?: number;
          gst?: number;
          razorpay_fee?: number;
          tcs?: number;
          customer_platform_fee?: number;
          customer_convenience_fee?: number;
        };
        Update: Partial<Database['public']['Tables']['ledger']['Insert']>;
      };
      disputes: {
        Row: {
          id: string;
          order_id: string | null;
          store_id: string | null;
          reason: string;
          image_url?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'resolved';
          admin_comment?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['disputes']['Row']>;
        Update: Partial<Database['public']['Tables']['disputes']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          gender: string | null;
          birthday: string | null;
          avatar: string | null;
          email: string | null;
          updated_at: string | null;
          user_role: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      store_profiles: {
        Row: {
          id: string;
          store_name: string;
          gstin?: string | null;
          is_gst_verified?: boolean | null;
          upi_id?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          delivery_radius?: number | null;
          support_phone?: string | null;
          open_time?: string | null;
          close_time?: string | null;
          is_setup?: boolean | null;
          created_at?: string;
          is_online: boolean;
          accepts_cod?: boolean | null;
          accepts_upi?: boolean | null;
          accepts_card?: boolean | null;
          offers_enabled?: boolean | null;
          instant_delivery?: boolean | null;
          standard_delivery: boolean;
          instant_fee?: number | null;
          standard_delivery_fee: number;
          min_standard_delivery_amount: number | null;
          min_instant_delivery_amount: number | null;
          free_standard_delivery_above: number | null;
          free_instant_delivery_above: number | null;
          flag_status?: 'flagged' | 'not_flagged';
        };
        Insert: Partial<Database['public']['Tables']['store_profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['store_profiles']['Row']>;
      };
      delivery_slots: {
        Row: {
          id: string;
          store_id: string | null;
          start_time: string;
          end_time: string;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          store_id?: string | null;
          start_time: string;
          end_time: string;
          is_active?: boolean | null;
        };
        Update: Partial<Database['public']['Tables']['delivery_slots']['Insert']>;
      };
      global_products: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          category: string | null;
          price: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          category?: string | null;
          price?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          category?: string | null;
          price?: number | null;
        };
      };
      partner_withdrawals: {
        Row: {
          id: string;
          store_id: string;
          amount: number;
          status: 'pending' | 'processed' | 'failed';
          payment_method_id: string;
          payment_details: Json;
          requested_at: string;
          processed_at: string | null;
          razorpay_payout_id: string | null;
          error_details: string | null;
        };
        Insert: Partial<Database['public']['Tables']['partner_withdrawals']['Row']>;
        Update: Partial<Database['public']['Tables']['partner_withdrawals']['Row']>;
      };
      partner_settlements: {
        Row: {
          id: string;
          store_id: string;
          amount: number;
          status: 'pending' | 'approved' | 'rejected';
          transaction_id: string | null;
          screenshot_url: string | null;
          requested_at: string;
          approved_at: string | null;
          rejection_reason: string | null;
          admin_comment: string | null;
        };
        Insert: Partial<Database['public']['Tables']['partner_settlements']['Row']>;
        Update: Partial<Database['public']['Tables']['partner_settlements']['Row']>;
      };
      // START: New Fee Structure Table Definition
      fee_structures: {
        Row: {
          id: string;
          platform_fee_fixed: number;
          convenience_fee_percent: number;
          tcs_percent: number;
          gst_percent: number;
          razorpay_fee_percent: number;
          effective_from: string; // TIMESTAMPTZ
          status: 'ACTIVE' | 'SCHEDULED' | 'PAST' | 'CANCELLED';
          created_at: string;
          created_by_user_id: string | null;
          notes: string | null;
        };
        Insert: {
          platform_fee_fixed: number;
          convenience_fee_percent: number;
          tcs_percent: number;
          gst_percent: number;
          razorpay_fee_percent: number;
          effective_from: string;
          status?: 'ACTIVE' | 'SCHEDULED' | 'PAST' | 'CANCELLED';
          created_by_user_id: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['fee_structures']['Insert']>;
      };
      // END: New Fee Structure Table Definition
      // New tables for sales agent feature
      sales_agents: {
        Row: {
          id: string;
          email: string;
          view_token: string;
          created_at: string;
        };
        Insert: {
          email: string;
        };
        Update: Partial<Database['public']['Tables']['sales_agents']['Row']>;
      };
      agent_store_links: {
        Row: {
          id: string;
          agent_id: string;
          store_id: string;
          commission_start_date: string;
          commission_rate: number | null;
          is_active: boolean;
        };
        Insert: {
          agent_id: string;
          store_id: string;
          commission_rate?: number | null;
        };
        Update: Partial<Database['public']['Tables']['agent_store_links']['Row']>;
      };
      agent_commission_payouts: {
        Row: {
          id: string;
          agent_id: string;
          amount: number;
          transaction_id: string | null;
          payout_date: string;
          status: string;
        };
        Insert: {
          agent_id: string;
          amount: number;
          transaction_id?: string | null;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['agent_commission_payouts']['Row']>;
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          price: number;
          cost_price: number | null;
          quantity: number | null;
          barcode: string | null;
          image_url: string | null;
          source: string | null;
          is_loose: boolean | null;
          created_at: string | null;
          unit_type: string | null;
          unit_metric: string | null;
          unit_value: number | null;
          stock_quantity: number | null;
          global_product_id: string | null;
          brand: string | null;
          category_id: string | null;
          discount_id: string | null;
          parent_product_id: string | null;
          frozen_quantity: number;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
export type FeeStructure = 
  Database['public']['Tables']['fee_structures']['Row'];
export type NewFeeStructure = 
  Database['public']['Tables']['fee_structures']['Insert'];