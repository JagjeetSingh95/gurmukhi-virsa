// Generated from Supabase project plkevjftjmiohxsedule (trimmed). Regenerate with:
// npx supabase gen types typescript --project-id plkevjftjmiohxsedule > src/lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] };

export type Profile = {
  id: string; email: string | null; consent_at: string | null; has_pin: boolean; pin_failed_count: number;
  pin_locked_until: string | null; plan: "free" | "family"; trial_ends_at: string | null; weekly_email: boolean;
  setup_done: boolean; created_at: string; weekly_day: number; reminder_on: boolean; reminder_hour: number;
  timezone: string; gurpurab_reminders: boolean;
};
export type Child = {
  id: string; parent_id: string; name: string; age_band: "4-5" | "6-7" | "8-9" | "10-12"; avatar: string;
  color_index: number; level: "new" | "some" | "reading"; streak_days: number; last_active_date: string | null; created_at: string;
  daily_goal_min: 3 | 5 | 10 | 15; reminder: boolean;
};
export type Progress = { id: string; child_id: string; kind: "letter" | "lesson" | "sakhi" | "quiz" | "paath"; item_id: string; stars: number; completed_at: string };
export type Bookmark = { id: string; user_id: string; child_id: string | null; bani_slug: string; line_id: string; created_at: string };
export type Settings = { id: string; user_id: string; child_id: string | null; data: Json; updated_at: string };
export type Activity = { child_id: string; day: string; seconds: number };
export type FamilyCode = { code: string; parent_id: string; expires_at: string; used_at: string | null };

export type Database = {
  public: {
    Tables: {
      profiles: Row<Profile>; children: Row<Child>; progress: Row<Progress>; bookmarks: Row<Bookmark>;
      settings: Row<Settings>; family_codes: Row<FamilyCode>; activity: Row<Activity>;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_family_code: { Args: never; Returns: Json };
      reset_child_progress: { Args: { p_child: string }; Returns: undefined };
      clear_parent_pin: { Args: never; Returns: undefined };
      finish_setup: { Args: never; Returns: undefined };
      give_consent: { Args: never; Returns: undefined };
      item_is_free: { Args: { p_item: string; p_kind: string }; Returns: boolean };
      log_activity: { Args: { p_child: string; p_seconds: number; p_day?: string }; Returns: number };
      merge_guest: { Args: { p_bookmarks?: Json; p_settings?: Json }; Returns: number };
      record_progress: { Args: { p_child: string; p_item: string; p_kind: string; p_stars?: number; p_today?: string }; Returns: Progress };
      set_parent_pin: { Args: { p_pin: string }; Returns: undefined };
      verify_parent_pin: { Args: { p_pin: string }; Returns: Json };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
