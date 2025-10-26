// Database types aligned with Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AgeBand = '16-18' | '19-22' | '23-26' | '27+';
export type Seeking = 'cofounder' | 'teammate' | 'mentor' | 'investor';
export type Stage = 'idea' | 'prototype' | 'launched';
export type SwipeDirection = 'like' | 'pass';
export type VerificationType = 'linkedin' | 'github' | 'domain_email' | 'selfie';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          age_band: AgeBand;
          is_minor: boolean | null;
          timezone: string;
          languages: string[];
          created_at: string;
          verification_tier: number;
        };
        Insert: {
          id: string;
          display_name: string;
          age_band: AgeBand;
          timezone: string;
          languages?: string[];
          created_at?: string;
          verification_tier?: number;
        };
        Update: {
          id?: string;
          display_name?: string;
          age_band?: AgeBand;
          timezone?: string;
          languages?: string[];
          verification_tier?: number;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          headline: string | null;
          bio: string | null;
          location_geo: unknown | null;
          domains: string[];
          skills: string[];
          stage: Stage | null;
          commitment_hours: number | null;
          visibility: Json;
        };
        Insert: {
          user_id: string;
          headline?: string | null;
          bio?: string | null;
          location_geo?: unknown | null;
          domains?: string[];
          skills?: string[];
          stage?: Stage | null;
          commitment_hours?: number | null;
          visibility?: Json;
        };
        Update: {
          user_id?: string;
          headline?: string | null;
          bio?: string | null;
          location_geo?: unknown | null;
          domains?: string[];
          skills?: string[];
          stage?: Stage | null;
          commitment_hours?: number | null;
          visibility?: Json;
        };
      };
      intents: {
        Row: {
          user_id: string;
          seeking: Seeking;
          availability_text: string | null;
          expertise_areas: string[] | null;
          experience_level: string | null;
          investment_type: string | null;
          portfolio_size: string | null;
          portfolio_url: string | null;
        };
        Insert: {
          user_id: string;
          seeking: Seeking;
          availability_text?: string | null;
          expertise_areas?: string[] | null;
          experience_level?: string | null;
          investment_type?: string | null;
          portfolio_size?: string | null;
          portfolio_url?: string | null;
        };
        Update: {
          user_id?: string;
          seeking?: Seeking;
          availability_text?: string | null;
          expertise_areas?: string[] | null;
          experience_level?: string | null;
          investment_type?: string | null;
          portfolio_size?: string | null;
          portfolio_url?: string | null;
        };
      };
      swipes: {
        Row: {
          id: number;
          swiper_id: string;
          target_id: string;
          direction: SwipeDirection;
          created_at: string;
        };
        Insert: {
          swiper_id: string;
          target_id: string;
          direction: SwipeDirection;
          created_at?: string;
        };
        Update: {
          swiper_id?: string;
          target_id?: string;
          direction?: SwipeDirection;
        };
      };
      matches: {
        Row: {
          id: number;
          user_a: string;
          user_b: string;
          created_at: string;
          reason: Json;
        };
        Insert: {
          user_a: string;
          user_b: string;
          created_at?: string;
          reason?: Json;
        };
        Update: {
          user_a?: string;
          user_b?: string;
          reason?: Json;
        };
      };
      messages: {
        Row: {
          id: number;
          match_id: number;
          sender_id: string;
          body: string;
          attachments: string[];
          created_at: string;
        };
        Insert: {
          match_id: number;
          sender_id: string;
          body: string;
          attachments?: string[];
          created_at?: string;
        };
        Update: {
          match_id?: number;
          sender_id?: string;
          body?: string;
          attachments?: string[];
        };
      };
      verifications: {
        Row: {
          user_id: string;
          type: VerificationType;
          status: VerificationStatus;
          evidence_url: string | null;
          score: number | null;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          type: VerificationType;
          status?: VerificationStatus;
          evidence_url?: string | null;
          score?: number | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          type?: VerificationType;
          status?: VerificationStatus;
          evidence_url?: string | null;
          score?: number | null;
        };
      };
      reports: {
        Row: {
          id: number;
          reporter_id: string;
          target_id: string;
          reason: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_id: string;
          reason: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          reporter_id?: string;
          target_id?: string;
          reason?: string;
          details?: string | null;
        };
      };
      feature_flags: {
        Row: {
          user_id: string;
          flags: Json;
        };
        Insert: {
          user_id: string;
          flags?: Json;
        };
        Update: {
          user_id?: string;
          flags?: Json;
        };
      };
    };
    Functions: {
      get_candidates: {
        Args: { limit_count?: number };
        Returns: Database['public']['Tables']['users']['Row'][];
      };
    };
  };
}

// Composite types for API responses
export type User = Database['public']['Tables']['users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Intent = Database['public']['Tables']['intents']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Verification = Database['public']['Tables']['verifications']['Row'];

// Candidate type (user + profile + intent data)
export interface Candidate {
  user: User;
  profile: Profile;
  intent?: Intent;
}

// Match with populated user data
export interface MatchWithUsers extends Match {
  user_a_data?: User & { profile?: Profile };
  user_b_data?: User & { profile?: Profile };
}

