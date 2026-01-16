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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applicants: {
        Row: {
          age: number
          attachments: string[] | null
          availability: string | null
          city: string
          committee_preference: string | null
          created_at: string
          cv_url: string | null
          education: string
          email: string
          experience: string | null
          full_name: string
          governorate: string
          id: string
          join_application_id: string | null
          motivation: string
          phone: string
          reference_number: string | null
          screened_at: string | null
          screened_by: string | null
          screening_notes: string | null
          screening_score: number | null
          skills: string[] | null
          status: Database["public"]["Enums"]["applicant_status"]
          updated_at: string
        }
        Insert: {
          age: number
          attachments?: string[] | null
          availability?: string | null
          city: string
          committee_preference?: string | null
          created_at?: string
          cv_url?: string | null
          education: string
          email: string
          experience?: string | null
          full_name: string
          governorate: string
          id?: string
          join_application_id?: string | null
          motivation: string
          phone: string
          reference_number?: string | null
          screened_at?: string | null
          screened_by?: string | null
          screening_notes?: string | null
          screening_score?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["applicant_status"]
          updated_at?: string
        }
        Update: {
          age?: number
          attachments?: string[] | null
          availability?: string | null
          city?: string
          committee_preference?: string | null
          created_at?: string
          cv_url?: string | null
          education?: string
          email?: string
          experience?: string | null
          full_name?: string
          governorate?: string
          id?: string
          join_application_id?: string | null
          motivation?: string
          phone?: string
          reference_number?: string | null
          screened_at?: string | null
          screened_by?: string | null
          screening_notes?: string | null
          screening_score?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["applicant_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicants_committee_preference_fkey"
            columns: ["committee_preference"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicants_join_application_id_fkey"
            columns: ["join_application_id"]
            isOneToOne: false
            referencedRelation: "join_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          applicant_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hr_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          head_member_id: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          head_member_id?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          head_member_id?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      disciplinary_actions: {
        Row: {
          action_date: string
          approved_by: string | null
          created_at: string
          created_by: string | null
          disciplinary_type: Database["public"]["Enums"]["disciplinary_type"]
          evidence_urls: string[] | null
          id: string
          member_id: string
          outcome: string | null
          reason: string
          updated_at: string
        }
        Insert: {
          action_date?: string
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          disciplinary_type: Database["public"]["Enums"]["disciplinary_type"]
          evidence_urls?: string[] | null
          id?: string
          member_id: string
          outcome?: string | null
          reason: string
          updated_at?: string
        }
        Update: {
          action_date?: string
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          disciplinary_type?: Database["public"]["Enums"]["disciplinary_type"]
          evidence_urls?: string[] | null
          id?: string
          member_id?: string
          outcome?: string | null
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "hr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          applicant_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number
          id: string
          interviewer_id: string | null
          is_draft: boolean
          location: string | null
          meeting_link: string | null
          notes: string | null
          recommendation: string | null
          scheduled_at: string
          score_communication: number | null
          score_culture_fit: number | null
          score_motivation: number | null
          score_overall: number | null
          score_skills: number | null
          status: Database["public"]["Enums"]["interview_status"]
          total_score: number | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          is_draft?: boolean
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          recommendation?: string | null
          scheduled_at: string
          score_communication?: number | null
          score_culture_fit?: number | null
          score_motivation?: number | null
          score_overall?: number | null
          score_skills?: number | null
          status?: Database["public"]["Enums"]["interview_status"]
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          is_draft?: boolean
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          recommendation?: string | null
          scheduled_at?: string
          score_communication?: number | null
          score_culture_fit?: number | null
          score_motivation?: number | null
          score_overall?: number | null
          score_skills?: number | null
          status?: Database["public"]["Enums"]["interview_status"]
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "hr_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_applications: {
        Row: {
          age: number
          created_at: string
          education: string
          email: string
          experience: string | null
          governorate: string
          id: string
          motivation: string
          name: string
          phone: string
        }
        Insert: {
          age: number
          created_at?: string
          education: string
          email: string
          experience?: string | null
          governorate: string
          id?: string
          motivation: string
          name: string
          phone: string
        }
        Update: {
          age?: number
          created_at?: string
          education?: string
          email?: string
          experience?: string | null
          governorate?: string
          id?: string
          motivation?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          applicant_id: string | null
          attendance_rate: number | null
          avatar_url: string | null
          committee_id: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          join_date: string
          onboarding_checklist: Json | null
          onboarding_completed: boolean
          phone: string
          role_title: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          applicant_id?: string | null
          attendance_rate?: number | null
          avatar_url?: string | null
          committee_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          join_date?: string
          onboarding_checklist?: Json | null
          onboarding_completed?: boolean
          phone: string
          role_title?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string | null
          attendance_rate?: number | null
          avatar_url?: string | null
          committee_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          join_date?: string
          onboarding_checklist?: Json | null
          onboarding_completed?: boolean
          phone?: string
          role_title?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: true
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_evaluations: {
        Row: {
          attendance_commitment: number
          created_at: string
          evaluation_month: string
          evaluator_id: string | null
          evaluator_notes: string | null
          id: string
          initiative_growth: number
          is_submitted: boolean
          member_id: string
          policy_compliance: number
          task_execution: number
          team_collaboration: number
          total_score: number | null
          updated_at: string
        }
        Insert: {
          attendance_commitment: number
          created_at?: string
          evaluation_month: string
          evaluator_id?: string | null
          evaluator_notes?: string | null
          id?: string
          initiative_growth: number
          is_submitted?: boolean
          member_id: string
          policy_compliance: number
          task_execution: number
          team_collaboration: number
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          attendance_commitment?: number
          created_at?: string
          evaluation_month?: string
          evaluator_id?: string | null
          evaluator_notes?: string | null
          id?: string
          initiative_growth?: number
          is_submitted?: boolean
          member_id?: string
          policy_compliance?: number
          task_execution?: number
          team_collaboration?: number
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "hr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_evaluations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      recognition_actions: {
        Row: {
          action_date: string
          approved_by: string | null
          created_at: string
          created_by: string | null
          evidence_urls: string[] | null
          id: string
          member_id: string
          reason: string
          recognition_type: Database["public"]["Enums"]["recognition_type"]
          updated_at: string
        }
        Insert: {
          action_date?: string
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          evidence_urls?: string[] | null
          id?: string
          member_id: string
          reason: string
          recognition_type: Database["public"]["Enums"]["recognition_type"]
          updated_at?: string
        }
        Update: {
          action_date?: string
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          evidence_urls?: string[] | null
          id?: string
          member_id?: string
          reason?: string
          recognition_type?: Database["public"]["Enums"]["recognition_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recognition_actions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "hr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recognition_actions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          event_date: string | null
          id: string
          is_featured: boolean
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          is_featured?: boolean
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          is_featured?: boolean
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizational_structure: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          committee_id: string | null
          created_at: string
          created_by: string | null
          display_order: number | null
          email: string | null
          full_name_ar: string
          full_name_en: string | null
          id: string
          is_active: boolean
          phone: string | null
          photo_url: string | null
          position_title_ar: string | null
          position_title_en: string | null
          role: Database["public"]["Enums"]["structure_role"]
          updated_at: string
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          committee_id?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          email?: string | null
          full_name_ar: string
          full_name_en?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          position_title_ar?: string | null
          position_title_en?: string | null
          role: Database["public"]["Enums"]["structure_role"]
          updated_at?: string
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          committee_id?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          email?: string | null
          full_name_ar?: string
          full_name_en?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          position_title_ar?: string | null
          position_title_en?: string | null
          role?: Database["public"]["Enums"]["structure_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizational_structure_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          display_order: number | null
          id: string
          language: string
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value: string
          created_at?: string
          display_order?: number | null
          id?: string
          language?: string
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          display_order?: number | null
          id?: string
          language?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hr_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "hr"
      applicant_status:
      | "new"
      | "screening"
      | "interview_scheduled"
      | "interview_completed"
      | "accepted"
      | "rejected"
      | "waitlist"
      | "onboarding"
      | "withdrawn"
      disciplinary_type:
      | "verbal_warning"
      | "written_warning"
      | "final_warning"
      | "suspension"
      | "termination"
      interview_status:
      | "scheduled"
      | "completed"
      | "cancelled"
      | "no_show"
      | "rescheduled"
      member_status:
      | "active"
      | "inactive"
      | "suspended"
      | "on_leave"
      | "offboarded"
      recognition_type:
      | "appreciation"
      | "award"
      | "certificate"
      | "promotion"
      | "bonus"
      | "public_recognition"
      structure_role:
      | "president"
      | "coordinator"
      | "committee_head"
      | "committee_deputy"
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
      app_role: ["admin", "hr"],
      applicant_status: [
        "new",
        "screening",
        "interview_scheduled",
        "interview_completed",
        "accepted",
        "rejected",
        "waitlist",
        "onboarding",
        "withdrawn",
      ],
      disciplinary_type: [
        "verbal_warning",
        "written_warning",
        "final_warning",
        "suspension",
        "termination",
      ],
      interview_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      member_status: [
        "active",
        "inactive",
        "suspended",
        "on_leave",
        "offboarded",
      ],
      recognition_type: [
        "appreciation",
        "award",
        "certificate",
        "promotion",
        "bonus",
        "public_recognition",
      ],
      structure_role: [
        "president",
        "coordinator",
        "committee_head",
        "committee_deputy",
      ],
    },
  },
} as const
