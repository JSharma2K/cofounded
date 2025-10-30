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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      feature_flags: {
        Row: {
          flags: Json
          user_id: string
        }
        Insert: {
          flags?: Json
          user_id: string
        }
        Update: {
          flags?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      intents: {
        Row: {
          availability_text: string | null
          experience_level: string | null
          expertise_areas: string[] | null
          investment_type: string | null
          portfolio_size: string | null
          portfolio_url: string | null
          seeking: Database["public"]["Enums"]["seeking"]
          user_id: string
        }
        Insert: {
          availability_text?: string | null
          experience_level?: string | null
          expertise_areas?: string[] | null
          investment_type?: string | null
          portfolio_size?: string | null
          portfolio_url?: string | null
          seeking: Database["public"]["Enums"]["seeking"]
          user_id: string
        }
        Update: {
          availability_text?: string | null
          experience_level?: string | null
          expertise_areas?: string[] | null
          investment_type?: string | null
          portfolio_size?: string | null
          portfolio_url?: string | null
          seeking?: Database["public"]["Enums"]["seeking"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: number
          reason: Json | null
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: number
          reason?: Json | null
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: number
          reason?: Json | null
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          body: string
          created_at: string
          id: number
          match_id: number
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          body: string
          created_at?: string
          id?: number
          match_id: number
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          body?: string
          created_at?: string
          id?: number
          match_id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_members"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_text: string | null
          bio: string | null
          business_domains: string[] | null
          commitment_hours: number | null
          domains: string[] | null
          headline: string | null
          location_geo: unknown
          skills: string[] | null
          stage: string | null
          user_id: string
          visibility: Json | null
        }
        Insert: {
          availability_text?: string | null
          bio?: string | null
          business_domains?: string[] | null
          commitment_hours?: number | null
          domains?: string[] | null
          headline?: string | null
          location_geo?: unknown
          skills?: string[] | null
          stage?: string | null
          user_id: string
          visibility?: Json | null
        }
        Update: {
          availability_text?: string | null
          bio?: string | null
          business_domains?: string[] | null
          commitment_hours?: number | null
          domains?: string[] | null
          headline?: string | null
          location_geo?: unknown
          skills?: string[] | null
          stage?: string | null
          user_id?: string
          visibility?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: number
          reason: string
          reporter_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: number
          reason: string
          reporter_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: number
          reason?: string
          reporter_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: number
          swiper_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: number
          swiper_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: number
          swiper_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          created_at: string
          display_name: string
          id: string
          languages: string[] | null
          timezone: string
          user_role: string | null
          verification_tier: number
        }
        Insert: {
          age?: number | null
          created_at?: string
          display_name: string
          id: string
          languages?: string[] | null
          timezone: string
          user_role?: string | null
          verification_tier?: number
        }
        Update: {
          age?: number | null
          created_at?: string
          display_name?: string
          id?: string
          languages?: string[] | null
          timezone?: string
          user_role?: string | null
          verification_tier?: number
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string | null
          evidence_url: string | null
          score: number | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          evidence_url?: string | null
          score?: number | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          evidence_url?: string | null
          score?: number | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      match_members: {
        Row: {
          match_id: number | null
          user_a: string | null
          user_b: string | null
        }
        Insert: {
          match_id?: number | null
          user_a?: string | null
          user_b?: string | null
        }
        Update: {
          match_id?: number | null
          user_a?: string | null
          user_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_candidates: {
        Args: { limit_count?: number }
        Returns: Database["public"]["CompositeTypes"]["candidate_card"][]
        SetofOptions: {
          from: "*"
          to: "candidate_card"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      seeking: "founder" | "cofounder" | "teammate" | "mentor" | "investor"
    }
    CompositeTypes: {
      candidate_card: {
        user_id: string | null
        display_name: string | null
        headline: string | null
        age_band: string | null
        timezone: string | null
        domains: string[] | null
        skills: string[] | null
        stage: string | null
        verification_tier: number | null
        created_at: string | null
      }
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
      seeking: ["founder", "cofounder", "teammate", "mentor", "investor"],
    },
  },
} as const
