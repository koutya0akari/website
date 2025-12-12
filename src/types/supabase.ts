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
      diary: {
        Row: {
          id: string;
          title: string;
          slug: string;
          body: string | null;
          summary: string | null;
          folder: string | null;
          tags: string[] | null;
          status: "draft" | "published";
          hero_image_url: string | null;
          view_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          body?: string | null;
          summary?: string | null;
          folder?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          hero_image_url?: string | null;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          body?: string | null;
          summary?: string | null;
          folder?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          hero_image_url?: string | null;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
