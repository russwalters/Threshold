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
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: "free" | "pro" | "portfolio";
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: "free" | "pro" | "portfolio";
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: "free" | "pro" | "portfolio";
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          zip: string;
          property_type: "single_family" | "condo" | "townhouse" | "apartment";
          occupancy_status: "rental" | "primary" | "vacation";
          beds: number | null;
          baths: number | null;
          sqft: number | null;
          year_built: number | null;
          photo_url: string | null;
          rent_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          zip: string;
          property_type: "single_family" | "condo" | "townhouse" | "apartment";
          occupancy_status: "rental" | "primary" | "vacation";
          beds?: number | null;
          baths?: number | null;
          sqft?: number | null;
          year_built?: number | null;
          photo_url?: string | null;
          rent_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          zip?: string;
          property_type?: "single_family" | "condo" | "townhouse" | "apartment";
          occupancy_status?: "rental" | "primary" | "vacation";
          beds?: number | null;
          baths?: number | null;
          sqft?: number | null;
          year_built?: number | null;
          photo_url?: string | null;
          rent_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          type: string | null;
          photo_url: string | null;
          paint_colors: Json;
          fixtures: Json;
          features: string[] | null;
          light_bulbs: Json;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          type?: string | null;
          photo_url?: string | null;
          paint_colors?: Json;
          fixtures?: Json;
          features?: string[] | null;
          light_bulbs?: Json;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          type?: string | null;
          photo_url?: string | null;
          paint_colors?: Json;
          fixtures?: Json;
          features?: string[] | null;
          light_bulbs?: Json;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      appliances: {
        Row: {
          id: string;
          property_id: string;
          room_id: string | null;
          name: string;
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          photo_url: string | null;
          purchase_date: string | null;
          warranty_expiration: string | null;
          manual_url: string | null;
          status: "good" | "needs_attention" | "replace_soon";
          location: string | null;
          operating_tips: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          room_id?: string | null;
          name: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          photo_url?: string | null;
          purchase_date?: string | null;
          warranty_expiration?: string | null;
          manual_url?: string | null;
          status?: "good" | "needs_attention" | "replace_soon";
          location?: string | null;
          operating_tips?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          room_id?: string | null;
          name?: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          photo_url?: string | null;
          purchase_date?: string | null;
          warranty_expiration?: string | null;
          manual_url?: string | null;
          status?: "good" | "needs_attention" | "replace_soon";
          location?: string | null;
          operating_tips?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appliances_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appliances_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          }
        ];
      };
      service_history: {
        Row: {
          id: string;
          appliance_id: string;
          type: "repair" | "maintenance" | "inspection" | "installation";
          date: string;
          provider: string | null;
          description: string | null;
          cost: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appliance_id: string;
          type: "repair" | "maintenance" | "inspection" | "installation";
          date: string;
          provider?: string | null;
          description?: string | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          appliance_id?: string;
          type?: "repair" | "maintenance" | "inspection" | "installation";
          date?: string;
          provider?: string | null;
          description?: string | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_history_appliance_id_fkey";
            columns: ["appliance_id"];
            isOneToOne: false;
            referencedRelation: "appliances";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          category: "warranty" | "manual" | "receipt" | "inspection" | "insurance" | "lease" | "permit" | "other";
          file_url: string | null;
          file_size: number | null;
          uploaded_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          category?: "warranty" | "manual" | "receipt" | "inspection" | "insurance" | "lease" | "permit" | "other";
          file_url?: string | null;
          file_size?: number | null;
          uploaded_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          category?: "warranty" | "manual" | "receipt" | "inspection" | "insurance" | "lease" | "permit" | "other";
          file_url?: string | null;
          file_size?: number | null;
          uploaded_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      maintenance_events: {
        Row: {
          id: string;
          property_id: string;
          type: "scheduled" | "completed" | "upcoming";
          category: string | null;
          title: string;
          description: string | null;
          date: string | null;
          cost: number | null;
          provider: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: "scheduled" | "completed" | "upcoming";
          category?: string | null;
          title: string;
          description?: string | null;
          date?: string | null;
          cost?: number | null;
          provider?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          type?: "scheduled" | "completed" | "upcoming";
          category?: string | null;
          title?: string;
          description?: string | null;
          date?: string | null;
          cost?: number | null;
          provider?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      emergency_info: {
        Row: {
          id: string;
          property_id: string;
          water_shutoff: Json | null;
          electric_shutoff: Json | null;
          gas_shutoff: Json | null;
          fire_extinguishers: Json | null;
          emergency_contacts: Json;
          emergency_procedures: Json;
        };
        Insert: {
          id?: string;
          property_id: string;
          water_shutoff?: Json | null;
          electric_shutoff?: Json | null;
          gas_shutoff?: Json | null;
          fire_extinguishers?: Json | null;
          emergency_contacts?: Json;
          emergency_procedures?: Json;
        };
        Update: {
          id?: string;
          property_id?: string;
          water_shutoff?: Json | null;
          electric_shutoff?: Json | null;
          gas_shutoff?: Json | null;
          fire_extinguishers?: Json | null;
          emergency_contacts?: Json;
          emergency_procedures?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "emergency_info_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      handbook_configs: {
        Row: {
          id: string;
          property_id: string;
          share_id: string | null;
          published: boolean;
          password_hash: string | null;
          welcome_message: string | null;
          wifi: Json | null;
          parking: string | null;
          trash: string | null;
          house_rules: string[] | null;
          local_recommendations: Json;
          utility_info: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          share_id?: string | null;
          published?: boolean;
          password_hash?: string | null;
          welcome_message?: string | null;
          wifi?: Json | null;
          parking?: string | null;
          trash?: string | null;
          house_rules?: string[] | null;
          local_recommendations?: Json;
          utility_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          share_id?: string | null;
          published?: boolean;
          password_hash?: string | null;
          welcome_message?: string | null;
          wifi?: Json | null;
          parking?: string | null;
          trash?: string | null;
          house_rules?: string[] | null;
          local_recommendations?: Json;
          utility_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "handbook_configs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: "active" | "canceled" | "past_due" | "trialing";
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          type: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id?: string | null;
          type: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string | null;
          type?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_log_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_tier: "free" | "pro" | "portfolio";
      property_type: "single_family" | "condo" | "townhouse" | "apartment";
      occupancy_status: "rental" | "primary" | "vacation";
      appliance_status: "good" | "needs_attention" | "replace_soon";
      service_type: "repair" | "maintenance" | "inspection" | "installation";
      document_category: "warranty" | "manual" | "receipt" | "inspection" | "insurance" | "lease" | "permit" | "other";
      maintenance_type: "scheduled" | "completed" | "upcoming";
      subscription_status: "active" | "canceled" | "past_due" | "trialing";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ---- Convenience type aliases ----

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export type Appliance = Database["public"]["Tables"]["appliances"]["Row"];
export type ApplianceInsert = Database["public"]["Tables"]["appliances"]["Insert"];
export type ApplianceUpdate = Database["public"]["Tables"]["appliances"]["Update"];

export type ServiceHistory = Database["public"]["Tables"]["service_history"]["Row"];
export type ServiceHistoryInsert = Database["public"]["Tables"]["service_history"]["Insert"];
export type ServiceHistoryUpdate = Database["public"]["Tables"]["service_history"]["Update"];

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export type MaintenanceEvent = Database["public"]["Tables"]["maintenance_events"]["Row"];
export type MaintenanceEventInsert = Database["public"]["Tables"]["maintenance_events"]["Insert"];
export type MaintenanceEventUpdate = Database["public"]["Tables"]["maintenance_events"]["Update"];

export type EmergencyInfo = Database["public"]["Tables"]["emergency_info"]["Row"];
export type EmergencyInfoInsert = Database["public"]["Tables"]["emergency_info"]["Insert"];
export type EmergencyInfoUpdate = Database["public"]["Tables"]["emergency_info"]["Update"];

export type HandbookConfig = Database["public"]["Tables"]["handbook_configs"]["Row"];
export type HandbookConfigInsert = Database["public"]["Tables"]["handbook_configs"]["Insert"];
export type HandbookConfigUpdate = Database["public"]["Tables"]["handbook_configs"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type ActivityLogInsert = Database["public"]["Tables"]["activity_log"]["Insert"];
export type ActivityLogUpdate = Database["public"]["Tables"]["activity_log"]["Update"];

// ---- Enum type aliases ----

export type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];
export type PropertyType = Database["public"]["Enums"]["property_type"];
export type OccupancyStatus = Database["public"]["Enums"]["occupancy_status"];
export type ApplianceStatus = Database["public"]["Enums"]["appliance_status"];
export type ServiceType = Database["public"]["Enums"]["service_type"];
export type DocumentCategory = Database["public"]["Enums"]["document_category"];
export type MaintenanceType = Database["public"]["Enums"]["maintenance_type"];
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
