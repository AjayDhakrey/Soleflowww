export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'salesperson';
          role_label: string | null;
          phone: string | null;
          zone: string | null;
          cluster: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'salesperson';
          role_label?: string | null;
          phone?: string | null;
          zone?: string | null;
          cluster?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'salesperson';
          role_label?: string | null;
          phone?: string | null;
          zone?: string | null;
          cluster?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      salesmen: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          emp_id: string | null;
          zone: string | null;
          cluster: string | null;
          commission_rate: number;
          monthly_target: number;
          booked_this_month: number;
          collection_due: number;
          assigned_kit: string | null;
          kit_verified_date: string | null;
          photo_url: string | null;
          status: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          emp_id?: string | null;
          zone?: string | null;
          cluster?: string | null;
          commission_rate?: number;
          monthly_target?: number;
          booked_this_month?: number;
          collection_due?: number;
          assigned_kit?: string | null;
          kit_verified_date?: string | null;
          photo_url?: string | null;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          emp_id?: string | null;
          zone?: string | null;
          cluster?: string | null;
          commission_rate?: number;
          monthly_target?: number;
          booked_this_month?: number;
          collection_due?: number;
          assigned_kit?: string | null;
          kit_verified_date?: string | null;
          photo_url?: string | null;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      manufacturers: {
        Row: {
          id: string;
          name: string;
          location: string;
          general_manager: string | null;
          phone: string | null;
          primary_specialization: string | null;
          est_year: number | null;
          monthly_capacity_pairs: number;
          active_batches_count: number;
          on_time_delivery_rate: number;
          qc_pass_ratio: number;
          load_percentage: number;
          tooling_lead_time_days: number;
          molds_active_count: number;
          status: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          general_manager?: string | null;
          phone?: string | null;
          primary_specialization?: string | null;
          est_year?: number | null;
          monthly_capacity_pairs?: number;
          active_batches_count?: number;
          on_time_delivery_rate?: number;
          qc_pass_ratio?: number;
          load_percentage?: number;
          tooling_lead_time_days?: number;
          molds_active_count?: number;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          general_manager?: string | null;
          phone?: string | null;
          primary_specialization?: string | null;
          est_year?: number | null;
          monthly_capacity_pairs?: number;
          active_batches_count?: number;
          on_time_delivery_rate?: number;
          qc_pass_ratio?: number;
          load_percentage?: number;
          tooling_lead_time_days?: number;
          molds_active_count?: number;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string;
          whatsapp: string | null;
          email: string | null;
          city: string;
          state: string;
          cluster: string | null;
          address: string | null;
          gstin: string | null;
          salesperson_id: string | null;
          payment_terms: string;
          credit_limit: number;
          tier: string;
          status: string;
          notes: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone: string;
          whatsapp?: string | null;
          email?: string | null;
          city: string;
          state: string;
          cluster?: string | null;
          address?: string | null;
          gstin?: string | null;
          salesperson_id?: string | null;
          payment_terms?: string;
          credit_limit?: number;
          tier?: string;
          status?: string;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string;
          whatsapp?: string | null;
          email?: string | null;
          city?: string;
          state?: string;
          cluster?: string | null;
          address?: string | null;
          gstin?: string | null;
          salesperson_id?: string | null;
          payment_terms?: string;
          credit_limit?: number;
          tier?: string;
          status?: string;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      designs: {
        Row: {
          id: string;
          article_code: string;
          name: string;
          category: string;
          wholesale_price: number;
          sample_price: number | null;
          moq_pairs: number;
          moq_cartons: number;
          sizes: number[];
          colors: string[];
          tags: string[];
          sole_type: string | null;
          upper_material: string | null;
          pairs_per_carton: number;
          margin_badge: string | null;
          velocity_badge: string | null;
          image_url: string | null;
          is_active: boolean;
          status: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_code: string;
          name: string;
          category: string;
          wholesale_price: number;
          sample_price?: number | null;
          moq_pairs?: number;
          moq_cartons?: number;
          sizes?: number[];
          colors?: string[];
          tags?: string[];
          sole_type?: string | null;
          upper_material?: string | null;
          pairs_per_carton?: number;
          margin_badge?: string | null;
          velocity_badge?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_code?: string;
          name?: string;
          category?: string;
          wholesale_price?: number;
          sample_price?: number | null;
          moq_pairs?: number;
          moq_cartons?: number;
          sizes?: number[];
          colors?: string[];
          tags?: string[];
          sole_type?: string | null;
          upper_material?: string | null;
          pairs_per_carton?: number;
          margin_badge?: string | null;
          velocity_badge?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          status?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      design_images: {
        Row: {
          id: string;
          design_id: string;
          image_url: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          design_id: string;
          image_url: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          image_url?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          client_id: string;
          salesperson_id: string | null;
          manufacturer_id: string | null;
          status: string;
          subtotal: number;
          trade_discount_percent: number;
          trade_discount_amount: number;
          taxable_subtotal: number;
          gst_percent: number;
          gst_amount: number;
          net_payable: number;
          advance_deposited: number;
          balance_due: number;
          payment_status: string;
          expected_delivery: string | null;
          order_date: string;
          batch_number: string | null;
          notes: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          salesperson_id?: string | null;
          manufacturer_id?: string | null;
          status?: string;
          subtotal?: number;
          trade_discount_percent?: number;
          trade_discount_amount?: number;
          taxable_subtotal?: number;
          gst_percent?: number;
          gst_amount?: number;
          net_payable?: number;
          advance_deposited?: number;
          balance_due?: number;
          payment_status?: string;
          expected_delivery?: string | null;
          order_date?: string;
          batch_number?: string | null;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          salesperson_id?: string | null;
          manufacturer_id?: string | null;
          status?: string;
          subtotal?: number;
          trade_discount_percent?: number;
          trade_discount_amount?: number;
          taxable_subtotal?: number;
          gst_percent?: number;
          gst_amount?: number;
          net_payable?: number;
          advance_deposited?: number;
          balance_due?: number;
          payment_status?: string;
          expected_delivery?: string | null;
          order_date?: string;
          batch_number?: string | null;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          design_id: string | null;
          design_name: string;
          article_code: string;
          rate_per_pair: number;
          total_pairs: number;
          total_cartons: number;
          loose_pairs: number;
          item_subtotal: number;
          size_breakdown: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          design_id?: string | null;
          design_name: string;
          article_code: string;
          rate_per_pair: number;
          total_pairs: number;
          total_cartons?: number;
          loose_pairs?: number;
          item_subtotal: number;
          size_breakdown?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          design_id?: string | null;
          design_name?: string;
          article_code?: string;
          rate_per_pair?: number;
          total_pairs?: number;
          total_cartons?: number;
          loose_pairs?: number;
          item_subtotal?: number;
          size_breakdown?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          from_status: string | null;
          to_status: string;
          note: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          from_status?: string | null;
          to_status: string;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          from_status?: string | null;
          to_status?: string;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          amount: number;
          payment_mode: string;
          reference_no: string | null;
          payment_date: string;
          notes: string | null;
          salesperson_id: string | null;
          recorded_by: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          amount: number;
          payment_mode: string;
          reference_no?: string | null;
          payment_date?: string;
          notes?: string | null;
          salesperson_id?: string | null;
          recorded_by?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          amount?: number;
          payment_mode?: string;
          reference_no?: string | null;
          payment_date?: string;
          notes?: string | null;
          salesperson_id?: string | null;
          recorded_by?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_allocations: {
        Row: {
          id: string;
          payment_id: string;
          order_id: string;
          amount: number;
          allocated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          order_id: string;
          amount: number;
          allocated_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          order_id?: string;
          amount?: number;
          allocated_by?: string | null;
          created_at?: string;
        };
      };
      client_notes: {
        Row: {
          id: string;
          client_id: string;
          note: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          note: string;
          author_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          note?: string;
          author_id?: string | null;
          created_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          client_id: string;
          salesperson_id: string | null;
          order_id: string | null;
          reason: string;
          due_date: string;
          due_time: string | null;
          amount_due: number | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          salesperson_id?: string | null;
          order_id?: string | null;
          reason: string;
          due_date: string;
          due_time?: string | null;
          amount_due?: number | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          salesperson_id?: string | null;
          order_id?: string | null;
          reason?: string;
          due_date?: string;
          due_time?: string | null;
          amount_due?: number | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      field_visits: {
        Row: {
          id: string;
          client_id: string;
          salesperson_id: string | null;
          location: string;
          visit_date: string;
          visit_time: string | null;
          purpose: string;
          outcome: string | null;
          notes: string | null;
          status: string;
          verified_gps: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          salesperson_id?: string | null;
          location: string;
          visit_date?: string;
          visit_time?: string | null;
          purpose: string;
          outcome?: string | null;
          notes?: string | null;
          status?: string;
          verified_gps?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          salesperson_id?: string | null;
          location?: string;
          visit_date?: string;
          visit_time?: string | null;
          purpose?: string;
          outcome?: string | null;
          notes?: string | null;
          status?: string;
          verified_gps?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          link_tab: string | null;
          is_read: boolean;
          target_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          link_tab?: string | null;
          is_read?: boolean;
          target_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          link_tab?: string | null;
          is_read?: boolean;
          target_user_id?: string | null;
          created_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_name: string | null;
          actor_role: string | null;
          entity_type: string;
          entity_id: string;
          entity_title: string | null;
          action: string;
          details: Json;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          actor_role?: string | null;
          entity_type: string;
          entity_id: string;
          entity_title?: string | null;
          action: string;
          details?: Json;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          actor_role?: string | null;
          entity_type?: string;
          entity_id?: string;
          entity_title?: string | null;
          action?: string;
          details?: Json;
          source?: string;
          created_at?: string;
        };
      };
      design_shares: {
        Row: {
          id: string;
          share_token: string;
          client_id: string | null;
          shared_by: string | null;
          channel: string;
          view_count: number;
          last_viewed_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          share_token?: string;
          client_id?: string | null;
          shared_by?: string | null;
          channel?: string;
          view_count?: number;
          last_viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          share_token?: string;
          client_id?: string | null;
          shared_by?: string | null;
          channel?: string;
          view_count?: number;
          last_viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      design_share_items: {
        Row: {
          id: string;
          share_id: string;
          design_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          share_id: string;
          design_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          share_id?: string;
          design_id?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      v_order_financials: {
        Row: {
          order_id: string;
          client_id: string;
          salesperson_id: string | null;
          manufacturer_id: string | null;
          status: string;
          order_date: string;
          expected_delivery: string | null;
          item_count: number;
          total_pairs: number;
          total_cartons: number;
          subtotal: number;
          trade_discount_percent: number;
          trade_discount_amount: number;
          taxable_subtotal: number;
          gst_percent: number;
          gst_amount: number;
          net_payable: number;
          total_paid: number;
          balance_due: number;
          payment_status: string;
        };
      };
      v_client_financials: {
        Row: {
          client_id: string;
          name: string;
          contact_person: string | null;
          phone: string;
          city: string;
          state: string;
          cluster: string | null;
          salesperson_id: string | null;
          salesperson_name: string | null;
          payment_terms: string;
          credit_limit: number;
          tier: string;
          status: string;
          orders_count: number;
          total_business: number;
          total_paid: number;
          amount_due: number;
          last_order_date: string | null;
          last_payment_date: string | null;
          last_payment_amount: number;
          calculated_status: string;
        };
      };
      v_receivables: {
        Row: {
          client_id: string;
          client_name: string;
          phone: string;
          city: string;
          state: string;
          salesperson_id: string | null;
          salesperson_name: string | null;
          payment_terms: string;
          credit_limit: number;
          total_business: number;
          total_paid: number;
          total_outstanding: number;
          unpaid_orders_count: number;
          oldest_due_date: string | null;
          max_days_overdue: number;
          bucket_0_30: number;
          bucket_31_60: number;
          bucket_61_90: number;
          bucket_90_plus: number;
          status: string;
        };
      };
      v_salesman_performance: {
        Row: {
          salesperson_id: string;
          name: string;
          emp_id: string | null;
          zone: string | null;
          cluster: string | null;
          status: string;
          monthly_target: number;
          commission_rate: number;
          assigned_clients_count: number;
          total_orders_booked: number;
          total_sales_value: number;
          total_commission_accrued: number;
          total_collected: number;
          total_outstanding: number;
          today_visits_done: number;
          today_visits_total: number;
        };
      };
      v_design_performance: {
        Row: {
          design_id: string;
          article_code: string;
          name: string;
          category: string;
          wholesale_price: number;
          image_url: string | null;
          status: string;
          times_ordered: number;
          total_pairs_sold: number;
          total_revenue_generated: number;
          distinct_clients_count: number;
        };
      };
      v_manufacturer_performance: {
        Row: {
          manufacturer_id: string;
          name: string;
          location: string;
          general_manager: string | null;
          monthly_capacity_pairs: number;
          status: string;
          total_orders_assigned: number;
          active_production_orders: number;
          completed_orders: number;
          total_pairs_in_production: number;
          total_pairs_completed: number;
        };
      };
    };
    Functions: {
      create_client: {
        Args: { p_client: Json };
        Returns: Json;
      };
      archive_client: {
        Args: { p_client_id: string };
        Returns: Json;
      };
      assign_salesman: {
        Args: {
          p_client_id: string;
          p_salesperson_id: string;
        };
        Returns: Json;
      };
      create_design: {
        Args: { p_design: Json };
        Returns: Json;
      };
      share_designs: {
        Args: {
          p_design_ids: string[];
          p_client_id?: string | null;
          p_channel?: string;
        };
        Returns: Json;
      };
      create_order_draft: {
        Args: {
          p_order: Json;
          p_items: Json;
        };
        Returns: Json;
      };
      advance_order_status: {
        Args: {
          p_order_id: string;
          p_new_status: string;
          p_note?: string | null;
          p_manufacturer_id?: string | null;
        };
        Returns: Json;
      };
      record_payment: {
        Args: {
          p_payment: Json;
          p_allocations?: Json;
        };
        Returns: Json;
      };
      global_search: {
        Args: { p_query: string };
        Returns: Json;
      };
      get_shared_designs: {
        Args: { p_share_token: string };
        Returns: Json;
      };
    };
  };
}
