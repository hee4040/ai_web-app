/**
 * Supabase DB 타입 — 스키마와 동기화
 * supabase/migrations/001_initial_schema.sql 기준
 */

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
          display_name: string | null;
          avatar_url: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: number;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: number;
          name?: string;
          sort_order?: number;
        };
      };
      posts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          description: string;
          category_id: number;
          tags: string[];
          troubleshooting_raw: string | null;
          ai_summary: string | null;
          ai_keywords: string[];
          troubleshooting_notes: Json;
          created_at: string;
          updated_at: string;
          is_public: boolean;
          like_count: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          description: string;
          category_id: number;
          tags?: string[];
          troubleshooting_raw?: string | null;
          ai_summary?: string | null;
          ai_keywords?: string[];
          troubleshooting_notes?: Json;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          like_count?: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          description?: string;
          category_id?: number;
          tags?: string[];
          troubleshooting_raw?: string | null;
          ai_summary?: string | null;
          ai_keywords?: string[];
          troubleshooting_notes?: Json;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          like_count?: number;
        };
      };
      post_steps: {
        Row: {
          id: number;
          post_id: number;
          sort_order: number;
          content: string;
          image_url: string | null;
        };
        Insert: {
          id?: number;
          post_id: number;
          sort_order?: number;
          content: string;
          image_url?: string | null;
        };
        Update: {
          id?: number;
          post_id?: number;
          sort_order?: number;
          content?: string;
          image_url?: string | null;
        };
      };
      bookmarks: {
        Row: {
          user_id: string;
          post_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: number;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          user_id: string;
          post_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: number;
          created_at?: string;
        };
      };
      ai_responses: {
        Row: {
          id: number;
          user_id: string | null;
          prompt: string;
          response: string;
          provider: "google" | "groq";
          category: string;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          prompt: string;
          response: string;
          provider: "google" | "groq";
          category: string;
          response_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          prompt?: string;
          response?: string;
          provider?: "google" | "groq";
          category?: string;
          response_time_ms?: number | null;
          created_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// 편의 타입
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Post = Tables<"posts">;
export type PostStep = Tables<"post_steps">;
export type Bookmark = Tables<"bookmarks">;
export type PostLike = Tables<"post_likes">;
export type AIResponse = Tables<"ai_responses">;
