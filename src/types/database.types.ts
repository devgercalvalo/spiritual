// Tipos escritos a mano siguiendo el schema de supabase/migrations/*.sql,
// en el mismo formato que produce `supabase gen types typescript`.
// Cuando Supabase local esté corriendo, regenera con:
//   pnpm supabase:types
// (sobrescribe este archivo con la salida real del CLI).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "editor";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "admin" | "editor";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_url: string | null;
          category_id: string | null;
          status: "draft" | "published";
          author_id: string | null;
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string;
          cover_image_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          author_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          author_name: string;
          author_email: string;
          content: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          author_name: string;
          author_email: string;
          content: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          mercado_libre_url: string | null;
          price_display: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          mercado_libre_url?: string | null;
          price_display?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      kits: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kits"]["Insert"]>;
        Relationships: [];
      };
      kit_products: {
        Row: { kit_id: string; product_id: string };
        Insert: { kit_id: string; product_id: string };
        Update: Partial<Database["public"]["Tables"]["kit_products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "kit_products_kit_id_fkey";
            columns: ["kit_id"];
            isOneToOne: false;
            referencedRelation: "kits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "kit_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      post_kits: {
        Row: { post_id: string; kit_id: string };
        Insert: { post_id: string; kit_id: string };
        Update: Partial<Database["public"]["Tables"]["post_kits"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "post_kits_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_kits_kit_id_fkey";
            columns: ["kit_id"];
            isOneToOne: false;
            referencedRelation: "kits";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type PublicTables = Database["public"]["Tables"];

export type Category = PublicTables["categories"]["Row"];
export type Post = PublicTables["posts"]["Row"];
export type Comment = PublicTables["comments"]["Row"];
export type Product = PublicTables["products"]["Row"];
export type Kit = PublicTables["kits"]["Row"];
export type Profile = PublicTables["profiles"]["Row"];
