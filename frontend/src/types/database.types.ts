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
      activity_events: {
        Row: {
          action: string
          actor: string
          actor_id: string | null
          client_id: string | null
          created_at: string
          design_id: string | null
          id: string
          manufacturer_id: string | null
          metadata: Json | null
          order_id: string | null
          payment_id: string | null
          record_id: string
          record_type: string
          salesman_id: string | null
          summary: string
        }
        Insert: {
          action: string
          actor: string
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          design_id?: string | null
          id?: string
          manufacturer_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          payment_id?: string | null
          record_id: string
          record_type: string
          salesman_id?: string | null
          summary: string
        }
        Update: {
          action?: string
          actor?: string
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          design_id?: string | null
          id?: string
          manufacturer_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          payment_id?: string | null
          record_id?: string
          record_type?: string
          salesman_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "activity_events_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "v_design_performance"
            referencedColumns: ["design_id"]
          },
          {
            foreignKeyName: "activity_events_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "v_manufacturer_performance"
            referencedColumns: ["manufacturer_id"]
          },
          {
            foreignKeyName: "activity_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "activity_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "sales_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_collections"
            referencedColumns: ["salesman_id"]
          },
          {
            foreignKeyName: "activity_events_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_performance"
            referencedColumns: ["salesman_id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          actorRole: string
          created_at: string | null
          id: string
          newValue: string
          oldValue: string | null
          recordId: string
          recordTitle: string
          recordType: string
          source: string | null
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          actorRole: string
          created_at?: string | null
          id: string
          newValue: string
          oldValue?: string | null
          recordId: string
          recordTitle: string
          recordType: string
          source?: string | null
          timestamp: string
        }
        Update: {
          action?: string
          actor?: string
          actorRole?: string
          created_at?: string | null
          id?: string
          newValue?: string
          oldValue?: string | null
          recordId?: string
          recordTitle?: string
          recordType?: string
          source?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      client_notes: {
        Row: {
          author_id: string | null
          author_name: string
          client_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          client_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          client_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      customers: {
        Row: {
          activityHistory: Json | null
          address: string | null
          amountDue: number | null
          archived_at: string | null
          businessName: string
          city: string
          cluster: string | null
          created_at: string | null
          created_by: string | null
          creditLimit: number | null
          email: string | null
          gstin: string | null
          id: string
          last_order_at: string | null
          last_payment_at: string | null
          lastOrderDate: string | null
          lastPaymentAmount: number | null
          lastPaymentDate: string | null
          notes: string | null
          ordersCount: number | null
          overdueDays: number | null
          paymentTerms: string | null
          phone: string
          propName: string
          salespersonId: string | null
          salespersonName: string | null
          state: string
          status: string | null
          tier: string | null
          topSellingModels: Json | null
          totalBusiness: number | null
          totalPaid: number | null
          updated_at: string | null
          updated_by: string | null
          whatsapp: string | null
        }
        Insert: {
          activityHistory?: Json | null
          address?: string | null
          amountDue?: number | null
          archived_at?: string | null
          businessName: string
          city: string
          cluster?: string | null
          created_at?: string | null
          created_by?: string | null
          creditLimit?: number | null
          email?: string | null
          gstin?: string | null
          id: string
          last_order_at?: string | null
          last_payment_at?: string | null
          lastOrderDate?: string | null
          lastPaymentAmount?: number | null
          lastPaymentDate?: string | null
          notes?: string | null
          ordersCount?: number | null
          overdueDays?: number | null
          paymentTerms?: string | null
          phone: string
          propName: string
          salespersonId?: string | null
          salespersonName?: string | null
          state: string
          status?: string | null
          tier?: string | null
          topSellingModels?: Json | null
          totalBusiness?: number | null
          totalPaid?: number | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string | null
        }
        Update: {
          activityHistory?: Json | null
          address?: string | null
          amountDue?: number | null
          archived_at?: string | null
          businessName?: string
          city?: string
          cluster?: string | null
          created_at?: string | null
          created_by?: string | null
          creditLimit?: number | null
          email?: string | null
          gstin?: string | null
          id?: string
          last_order_at?: string | null
          last_payment_at?: string | null
          lastOrderDate?: string | null
          lastPaymentAmount?: number | null
          lastPaymentDate?: string | null
          notes?: string | null
          ordersCount?: number | null
          overdueDays?: number | null
          paymentTerms?: string | null
          phone?: string
          propName?: string
          salespersonId?: string | null
          salespersonName?: string | null
          state?: string
          status?: string | null
          tier?: string | null
          topSellingModels?: Json | null
          totalBusiness?: number | null
          totalPaid?: number | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      design_images: {
        Row: {
          created_at: string
          design_id: string
          id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          design_id: string
          id?: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          design_id?: string
          id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_images_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_images_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "v_design_performance"
            referencedColumns: ["design_id"]
          },
        ]
      }
      design_share_items: {
        Row: {
          design_id: string
          id: string
          share_id: string
        }
        Insert: {
          design_id: string
          id?: string
          share_id: string
        }
        Update: {
          design_id?: string
          id?: string
          share_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_share_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_share_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "v_design_performance"
            referencedColumns: ["design_id"]
          },
          {
            foreignKeyName: "design_share_items_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "design_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      design_shares: {
        Row: {
          archived_at: string | null
          channel: string | null
          created_at: string | null
          created_by: string | null
          designIds: Json | null
          designNames: Json | null
          designsCount: number | null
          id: string
          orderId: string | null
          sharedBy: string
          sharedByRole: string
          targetClientId: string | null
          targetClientName: string
          targetPhone: string
          timestamp: string
          token: string | null
          updated_at: string | null
          updated_by: string | null
          viewCount: number | null
          viewed_at: string | null
          wasOrdered: boolean | null
          wasViewed: boolean | null
        }
        Insert: {
          archived_at?: string | null
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          designIds?: Json | null
          designNames?: Json | null
          designsCount?: number | null
          id: string
          orderId?: string | null
          sharedBy: string
          sharedByRole: string
          targetClientId?: string | null
          targetClientName: string
          targetPhone: string
          timestamp: string
          token?: string | null
          updated_at?: string | null
          updated_by?: string | null
          viewCount?: number | null
          viewed_at?: string | null
          wasOrdered?: boolean | null
          wasViewed?: boolean | null
        }
        Update: {
          archived_at?: string | null
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          designIds?: Json | null
          designNames?: Json | null
          designsCount?: number | null
          id?: string
          orderId?: string | null
          sharedBy?: string
          sharedByRole?: string
          targetClientId?: string | null
          targetClientName?: string
          targetPhone?: string
          timestamp?: string
          token?: string | null
          updated_at?: string | null
          updated_by?: string | null
          viewCount?: number | null
          viewed_at?: string | null
          wasOrdered?: boolean | null
          wasViewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "design_shares_targetClientId_fkey"
            columns: ["targetClientId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_shares_targetClientId_fkey"
            columns: ["targetClientId"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      designs: {
        Row: {
          archived_at: string | null
          articleCode: string
          category: string
          colors: Json | null
          cost_per_pair: number | null
          created_at: string | null
          created_by: string | null
          id: string
          image: string
          marginBadge: string | null
          moqCartons: number | null
          moqPairs: number | null
          name: string
          pairsPerCarton: number | null
          price: number
          sizes: Json | null
          soleType: string | null
          status: string | null
          subline: string | null
          tags: Json | null
          updated_at: string | null
          updated_by: string | null
          upperMaterial: string | null
          velocityBadge: string | null
        }
        Insert: {
          archived_at?: string | null
          articleCode: string
          category: string
          colors?: Json | null
          cost_per_pair?: number | null
          created_at?: string | null
          created_by?: string | null
          id: string
          image: string
          marginBadge?: string | null
          moqCartons?: number | null
          moqPairs?: number | null
          name: string
          pairsPerCarton?: number | null
          price: number
          sizes?: Json | null
          soleType?: string | null
          status?: string | null
          subline?: string | null
          tags?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          upperMaterial?: string | null
          velocityBadge?: string | null
        }
        Update: {
          archived_at?: string | null
          articleCode?: string
          category?: string
          colors?: Json | null
          cost_per_pair?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image?: string
          marginBadge?: string | null
          moqCartons?: number | null
          moqPairs?: number | null
          name?: string
          pairsPerCarton?: number | null
          price?: number
          sizes?: Json | null
          soleType?: string | null
          status?: string | null
          subline?: string | null
          tags?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          upperMaterial?: string | null
          velocityBadge?: string | null
        }
        Relationships: []
      }
      discount_requests: {
        Row: {
          approved_percent: number | null
          client_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          default_percent: number
          id: string
          margin_concession: number
          order_id: string
          order_subtotal: number
          pairs: number
          product_summary: string | null
          projected_margin_percent: number | null
          reason: string
          requested_by: string
          requested_percent: number
          salesman_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_percent?: number | null
          client_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          default_percent: number
          id: string
          margin_concession: number
          order_id: string
          order_subtotal: number
          pairs: number
          product_summary?: string | null
          projected_margin_percent?: number | null
          reason: string
          requested_by: string
          requested_percent: number
          salesman_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_percent?: number | null
          client_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          default_percent?: number
          id?: string
          margin_concession?: number
          order_id?: string
          order_subtotal?: number
          pairs?: number
          product_summary?: string | null
          projected_margin_percent?: number | null
          reason?: string
          requested_by?: string
          requested_percent?: number
          salesman_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "discount_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
        ]
      }
      field_visits: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          outcome: string | null
          purpose: string
          salesperson_id: string | null
          salesperson_name: string
          status: string
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          purpose: string
          salesperson_id?: string | null
          salesperson_name: string
          status?: string
          updated_at?: string | null
          visit_date?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          purpose?: string
          salesperson_id?: string | null
          salesperson_name?: string
          status?: string
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "field_visits_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "sales_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visits_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_collections"
            referencedColumns: ["salesman_id"]
          },
          {
            foreignKeyName: "field_visits_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_performance"
            referencedColumns: ["salesman_id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          client_id: string
          created_at: string
          due_at: string
          id: string
          outcome: string | null
          owner_id: string | null
          owner_name: string
          priority: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_at: string
          id?: string
          outcome?: string | null
          owner_id?: string | null
          owner_name: string
          priority?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_at?: string
          id?: string
          outcome?: string | null
          owner_id?: string | null
          owner_name?: string
          priority?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          activeOrdersList: Json | null
          archived_at: string | null
          companyName: string
          created_at: string | null
          created_by: string | null
          estYear: number | null
          generalManager: string | null
          hubLocation: string
          id: string
          loadPercentage: number | null
          moldsActiveCount: number | null
          monthlyCapacityPairs: number | null
          onTimeDeliveryRate: number | null
          phone: string | null
          primarySpecialization: string | null
          qcPassRatio: number | null
          runningBatchesCount: number | null
          status: string | null
          toolingLeadTimeDays: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activeOrdersList?: Json | null
          archived_at?: string | null
          companyName: string
          created_at?: string | null
          created_by?: string | null
          estYear?: number | null
          generalManager?: string | null
          hubLocation: string
          id: string
          loadPercentage?: number | null
          moldsActiveCount?: number | null
          monthlyCapacityPairs?: number | null
          onTimeDeliveryRate?: number | null
          phone?: string | null
          primarySpecialization?: string | null
          qcPassRatio?: number | null
          runningBatchesCount?: number | null
          status?: string | null
          toolingLeadTimeDays?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activeOrdersList?: Json | null
          archived_at?: string | null
          companyName?: string
          created_at?: string | null
          created_by?: string | null
          estYear?: number | null
          generalManager?: string | null
          hubLocation?: string
          id?: string
          loadPercentage?: number | null
          moldsActiveCount?: number | null
          monthlyCapacityPairs?: number | null
          onTimeDeliveryRate?: number | null
          phone?: string | null
          primarySpecialization?: string | null
          qcPassRatio?: number | null
          runningBatchesCount?: number | null
          status?: string | null
          toolingLeadTimeDays?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_role: string | null
          record_id: string | null
          record_type: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_role?: string | null
          record_id?: string | null
          record_type?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_role?: string | null
          record_id?: string | null
          record_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cartons: number
          created_at: string
          design_code_snapshot: string
          design_id: string | null
          design_name_snapshot: string
          discount: number
          id: string
          line_total: number | null
          order_id: string
          qty_pairs: number
          rate: number
          size_matrix: Json | null
          updated_at: string
        }
        Insert: {
          cartons?: number
          created_at?: string
          design_code_snapshot: string
          design_id?: string | null
          design_name_snapshot: string
          discount?: number
          id?: string
          line_total?: number | null
          order_id: string
          qty_pairs: number
          rate: number
          size_matrix?: Json | null
          updated_at?: string
        }
        Update: {
          cartons?: number
          created_at?: string
          design_code_snapshot?: string
          design_id?: string | null
          design_name_snapshot?: string
          discount?: number
          id?: string
          line_total?: number | null
          order_id?: string
          qty_pairs?: number
          rate?: number
          size_matrix?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "v_design_performance"
            referencedColumns: ["design_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor: string
          actor_id: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          actor: string
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          actor?: string
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
        ]
      }
      orders: {
        Row: {
          advanceDeposited: number | null
          archived_at: string | null
          balanceDue: number | null
          batchNumber: string | null
          cartonsCount: number
          created_at: string | null
          created_by: string | null
          customerCity: string | null
          customerId: string | null
          customerName: string
          customerState: string | null
          expected_delivery_at: string | null
          expectedDelivery: string | null
          gstAmount: number | null
          gstPercent: number | null
          id: string
          items: Json
          manufacturerId: string | null
          manufacturerName: string | null
          manufacturerPlant: string | null
          netPayable: number
          order_date_at: string | null
          orderDate: string | null
          pairsCount: number
          paymentStatus: string | null
          propName: string | null
          salespersonId: string | null
          salespersonName: string | null
          status: string | null
          subtotal: number
          taxableSubtotal: number
          timeline: Json | null
          tradeDiscountAmount: number | null
          tradeDiscountPercent: number | null
          updated_at: string | null
          updated_by: string | null
          wholesaleRate: number
        }
        Insert: {
          advanceDeposited?: number | null
          archived_at?: string | null
          balanceDue?: number | null
          batchNumber?: string | null
          cartonsCount?: number
          created_at?: string | null
          created_by?: string | null
          customerCity?: string | null
          customerId?: string | null
          customerName: string
          customerState?: string | null
          expected_delivery_at?: string | null
          expectedDelivery?: string | null
          gstAmount?: number | null
          gstPercent?: number | null
          id: string
          items?: Json
          manufacturerId?: string | null
          manufacturerName?: string | null
          manufacturerPlant?: string | null
          netPayable?: number
          order_date_at?: string | null
          orderDate?: string | null
          pairsCount?: number
          paymentStatus?: string | null
          propName?: string | null
          salespersonId?: string | null
          salespersonName?: string | null
          status?: string | null
          subtotal?: number
          taxableSubtotal?: number
          timeline?: Json | null
          tradeDiscountAmount?: number | null
          tradeDiscountPercent?: number | null
          updated_at?: string | null
          updated_by?: string | null
          wholesaleRate?: number
        }
        Update: {
          advanceDeposited?: number | null
          archived_at?: string | null
          balanceDue?: number | null
          batchNumber?: string | null
          cartonsCount?: number
          created_at?: string | null
          created_by?: string | null
          customerCity?: string | null
          customerId?: string | null
          customerName?: string
          customerState?: string | null
          expected_delivery_at?: string | null
          expectedDelivery?: string | null
          gstAmount?: number | null
          gstPercent?: number | null
          id?: string
          items?: Json
          manufacturerId?: string | null
          manufacturerName?: string | null
          manufacturerPlant?: string | null
          netPayable?: number
          order_date_at?: string | null
          orderDate?: string | null
          pairsCount?: number
          paymentStatus?: string | null
          propName?: string | null
          salespersonId?: string | null
          salespersonName?: string | null
          status?: string | null
          subtotal?: number
          taxableSubtotal?: number
          timeline?: Json | null
          tradeDiscountAmount?: number | null
          tradeDiscountPercent?: number | null
          updated_at?: string | null
          updated_by?: string | null
          wholesaleRate?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      payment_adjustments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          order_id: string | null
          reason: string
          reverses_payment_id: string | null
          type: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string | null
          reason: string
          reverses_payment_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string | null
          reason?: string
          reverses_payment_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_adjustments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_adjustments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_adjustments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_adjustments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_adjustments_reverses_payment_id_fkey"
            columns: ["reverses_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_financials"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amountDueAfter: number
          amountDueBefore: number
          archived_at: string | null
          bounce_reason: string | null
          cheque_bank: string | null
          cheque_date: string | null
          cheque_no: string | null
          collectedBy: string | null
          created_at: string | null
          created_by: string | null
          customerCity: string | null
          customerId: string | null
          customerName: string
          id: string
          idempotency_key: string | null
          notes: string | null
          orderId: string | null
          orderNumber: string | null
          payment_date_at: string | null
          paymentAmount: number
          paymentDate: string
          paymentMethod: string
          receipt_path: string | null
          receiptNumber: string
          reversal_reason: string | null
          sentSms: boolean | null
          status: string
          updated_at: string | null
          updated_by: string | null
          utrRef: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amountDueAfter?: number
          amountDueBefore?: number
          archived_at?: string | null
          bounce_reason?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_no?: string | null
          collectedBy?: string | null
          created_at?: string | null
          created_by?: string | null
          customerCity?: string | null
          customerId?: string | null
          customerName: string
          id: string
          idempotency_key?: string | null
          notes?: string | null
          orderId?: string | null
          orderNumber?: string | null
          payment_date_at?: string | null
          paymentAmount: number
          paymentDate: string
          paymentMethod: string
          receipt_path?: string | null
          receiptNumber: string
          reversal_reason?: string | null
          sentSms?: boolean | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          utrRef: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amountDueAfter?: number
          amountDueBefore?: number
          archived_at?: string | null
          bounce_reason?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_no?: string | null
          collectedBy?: string | null
          created_at?: string | null
          created_by?: string | null
          customerCity?: string | null
          customerId?: string | null
          customerName?: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          orderId?: string | null
          orderNumber?: string | null
          payment_date_at?: string | null
          paymentAmount?: number
          paymentDate?: string
          paymentMethod?: string
          receipt_path?: string | null
          receiptNumber?: string
          reversal_reason?: string | null
          sentSms?: boolean | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          utrRef?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: string
          sales_team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          sales_team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          sales_team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_sales_team_id_fkey"
            columns: ["sales_team_id"]
            isOneToOne: false
            referencedRelation: "sales_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sales_team_id_fkey"
            columns: ["sales_team_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_collections"
            referencedColumns: ["salesman_id"]
          },
          {
            foreignKeyName: "profiles_sales_team_id_fkey"
            columns: ["sales_team_id"]
            isOneToOne: false
            referencedRelation: "v_salesman_performance"
            referencedColumns: ["salesman_id"]
          },
        ]
      }
      sales_team: {
        Row: {
          archived_at: string | null
          assignedAccountsCount: number | null
          assignedKit: string | null
          bookedThisMonth: number | null
          chequesTodayAmount: number | null
          cluster: string | null
          collectionDue: number | null
          commissionAccrued: number | null
          commissionRate: number | null
          created_at: string | null
          created_by: string | null
          email: string | null
          empId: string | null
          id: string
          kitVerifiedDate: string | null
          monthlyTarget: number | null
          name: string
          phone: string | null
          photo: string | null
          roleTitle: string
          status: string | null
          tasksChecklist: Json | null
          todayVisitsDone: number | null
          todayVisitsTotal: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          zone: string | null
        }
        Insert: {
          archived_at?: string | null
          assignedAccountsCount?: number | null
          assignedKit?: string | null
          bookedThisMonth?: number | null
          chequesTodayAmount?: number | null
          cluster?: string | null
          collectionDue?: number | null
          commissionAccrued?: number | null
          commissionRate?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          empId?: string | null
          id: string
          kitVerifiedDate?: string | null
          monthlyTarget?: number | null
          name: string
          phone?: string | null
          photo?: string | null
          roleTitle: string
          status?: string | null
          tasksChecklist?: Json | null
          todayVisitsDone?: number | null
          todayVisitsTotal?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          zone?: string | null
        }
        Update: {
          archived_at?: string | null
          assignedAccountsCount?: number | null
          assignedKit?: string | null
          bookedThisMonth?: number | null
          chequesTodayAmount?: number | null
          cluster?: string | null
          collectionDue?: number | null
          commissionAccrued?: number | null
          commissionRate?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          empId?: string | null
          id?: string
          kitVerifiedDate?: string | null
          monthlyTarget?: number | null
          name?: string
          phone?: string | null
          photo?: string | null
          roleTitle?: string
          status?: string | null
          tasksChecklist?: Json | null
          todayVisitsDone?: number | null
          todayVisitsTotal?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          zone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_client_financials: {
        Row: {
          avg_order_value: number | null
          business_name: string | null
          city: string | null
          client_id: string | null
          client_status: string | null
          credit_limit: number | null
          last_order_at: string | null
          last_payment_amount: number | null
          last_payment_at: string | null
          orders_count: number | null
          outstanding: number | null
          overdue_amount: number | null
          payment_terms: string | null
          phone: string | null
          prop_name: string | null
          salesman_id: string | null
          salesman_name: string | null
          state: string | null
          total_business: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      v_design_performance: {
        Row: {
          article_code: string | null
          category: string | null
          design_id: string | null
          design_name: string | null
          price: number | null
          status: string | null
          total_orders_count: number | null
          total_pairs_ordered: number | null
          total_revenue_generated: number | null
          total_shares_count: number | null
          total_views_count: number | null
        }
        Relationships: []
      }
      v_discount_request_stats: {
        Row: {
          approved_this_month: number | null
          pending_concession_total: number | null
          pending_count: number | null
          rejected_this_month: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      v_manufacturer_performance: {
        Row: {
          active_orders_count: number | null
          active_pairs_count: number | null
          company_name: string | null
          hub_location: string | null
          manufacturer_id: string | null
          monthly_capacity_pairs: number | null
          on_time_rate: number | null
          qc_pass_ratio: number | null
          status: string | null
        }
        Relationships: []
      }
      v_order_financials: {
        Row: {
          adjustments: number | null
          age_days: number | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          expected_delivery_at: string | null
          is_overdue: boolean | null
          net_payable: number | null
          order_date_at: string | null
          order_id: string | null
          order_status: string | null
          outstanding: number | null
          paid_verified: number | null
          payment_status: string | null
          salesman_id: string | null
          salesman_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_receivables: {
        Row: {
          amount_due: number | null
          bucket_0_30: number | null
          bucket_31_60: number | null
          bucket_61_90: number | null
          bucket_90_plus: number | null
          client_id: string | null
          client_name: string | null
          max_age_days: number | null
          salesman_id: string | null
          salesman_name: string | null
          total_invoiced: number | null
          total_paid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customerId_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financials"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_salesman_collections: {
        Row: {
          cheques_in_transit: number | null
          collected_this_month: number | null
          pending_accounts_count: number | null
          salesman_id: string | null
          salesman_name: string | null
          total_pending_client_balance: number | null
        }
        Insert: {
          cheques_in_transit?: never
          collected_this_month?: never
          pending_accounts_count?: never
          salesman_id?: string | null
          salesman_name?: string | null
          total_pending_client_balance?: never
        }
        Update: {
          cheques_in_transit?: never
          collected_this_month?: never
          pending_accounts_count?: never
          salesman_id?: string | null
          salesman_name?: string | null
          total_pending_client_balance?: never
        }
        Relationships: []
      }
      v_salesman_performance: {
        Row: {
          assigned_clients_count: number | null
          cluster: string | null
          monthly_target: number | null
          orders_count: number | null
          pending_followups_count: number | null
          salesman_id: string | null
          salesman_name: string | null
          total_booked_value: number | null
          total_collections: number | null
          zone: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_order_status: {
        Args: { p_note?: string; p_order_id: string; p_to_status: string }
        Returns: Json
      }
      approve_discount_request: {
        Args: {
          p_approved_percent?: number
          p_note?: string
          p_request_id: string
        }
        Returns: Json
      }
      archive_client: {
        Args: { p_client_id: string; p_reason?: string }
        Returns: boolean
      }
      assign_salesman: {
        Args: { p_client_id: string; p_salesman_id: string }
        Returns: boolean
      }
      bounce_cheque: {
        Args: { p_payment_id: string; p_reason?: string }
        Returns: Json
      }
      can_access_client: { Args: { p_client_id: string }; Returns: boolean }
      cancel_discount_request: { Args: { p_request_id: string }; Returns: Json }
      clear_cheque: { Args: { p_payment_id: string }; Returns: Json }
      create_client: {
        Args: {
          p_address?: string
          p_business_name: string
          p_city?: string
          p_cluster?: string
          p_credit_limit?: number
          p_email?: string
          p_gstin?: string
          p_payment_terms?: string
          p_phone: string
          p_prop_name: string
          p_salesperson_id?: string
          p_state?: string
          p_whatsapp?: string
        }
        Returns: Json
      }
      create_design: {
        Args: {
          p_article_code: string
          p_category: string
          p_colors?: Json
          p_image?: string
          p_moq_cartons?: number
          p_moq_pairs?: number
          p_name: string
          p_price: number
          p_sizes?: Json
          p_sole_type?: string
          p_subline?: string
          p_upper_material?: string
        }
        Returns: Json
      }
      create_order_draft: {
        Args: {
          p_advance_deposited?: number
          p_client_id: string
          p_expected_delivery?: string
          p_gst_percent?: number
          p_items: Json
          p_notes?: string
          p_trade_discount_percent?: number
        }
        Returns: Json
      }
      current_salesman_id: { Args: never; Returns: string }
      gen_client_id: { Args: never; Returns: string }
      gen_design_id: { Args: never; Returns: string }
      gen_manufacturer_id: { Args: never; Returns: string }
      gen_order_id: { Args: never; Returns: string }
      gen_payment_id: { Args: never; Returns: string }
      get_shared_designs: { Args: { p_share_token: string }; Returns: Json }
      global_search: { Args: { q: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      record_payment:
        | {
            Args: {
              p_allocations?: Json
              p_amount: number
              p_cheque_bank?: string
              p_cheque_date?: string
              p_cheque_no?: string
              p_client_id: string
              p_idempotency_key?: string
              p_method?: string
              p_notes?: string
              p_payment_date?: string
              p_reference?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_allocations?: Json
              p_amount: number
              p_client_id: string
              p_method?: string
              p_notes?: string
              p_order_id: string
              p_receipt_path?: string
              p_reference?: string
            }
            Returns: Json
          }
      reject_discount_request: {
        Args: { p_note: string; p_request_id: string }
        Returns: Json
      }
      request_discount: {
        Args: {
          p_order_id: string
          p_reason: string
          p_requested_percent: number
        }
        Returns: Json
      }
      reverse_payment: {
        Args: { p_payment_id: string; p_reason?: string }
        Returns: Json
      }
      salesman_can_create_client: { Args: never; Returns: boolean }
      share_designs: {
        Args: {
          p_channel?: string
          p_client_ids: string[]
          p_design_ids: string[]
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      verify_payment: { Args: { p_payment_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
