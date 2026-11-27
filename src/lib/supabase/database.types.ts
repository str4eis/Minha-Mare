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
          full_name: string;
          retirement_goal: number;
          retirement_saved: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          retirement_goal?: number;
          retirement_saved?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          retirement_goal?: number;
          retirement_saved?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          custom_product: string | null;
          buyer: string;
          quantity: number;
          unit: string;
          value: number;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category: string;
          custom_product?: string | null;
          buyer?: string;
          quantity: number;
          unit: string;
          value: number;
          occurred_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          custom_product?: string | null;
          buyer?: string;
          quantity?: number;
          unit?: string;
          value?: number;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          category: string;
          custom_description: string | null;
          description: string;
          value: number;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          kind: string;
          category: string;
          custom_description?: string | null;
          description?: string;
          value: number;
          occurred_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          category?: string;
          custom_description?: string | null;
          description?: string;
          value?: number;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
