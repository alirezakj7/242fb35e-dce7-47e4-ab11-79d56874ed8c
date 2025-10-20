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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      financial_records: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at: string
          date: string
          description: string
          id: string
          routine_job_id: string | null
          task_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at?: string
          date?: string
          description: string
          id?: string
          routine_job_id?: string | null
          task_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at?: string
          date?: string
          description?: string
          id?: string
          routine_job_id?: string | null
          task_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_routine_job_id_fkey"
            columns: ["routine_job_id"]
            isOneToOne: false
            referencedRelation: "routine_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_records_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completed: boolean
          created_at: string
          current_amount: number | null
          deadline: string
          description: string | null
          id: string
          target_amount: number | null
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completed?: boolean
          created_at?: string
          current_amount?: number | null
          deadline: string
          description?: string | null
          id?: string
          target_amount?: number | null
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["wheel_of_life_category"]
          completed?: boolean
          created_at?: string
          current_amount?: number | null
          deadline?: string
          description?: string | null
          id?: string
          target_amount?: number | null
          title?: string
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completions: Json | null
          created_at: string
          days_of_week: number[]
          description: string | null
          id: string
          name: string
          reminder_time: string | null
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completions?: Json | null
          created_at?: string
          days_of_week: number[]
          description?: string | null
          id?: string
          name: string
          reminder_time?: string | null
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["wheel_of_life_category"]
          completions?: Json | null
          created_at?: string
          days_of_week?: number[]
          description?: string | null
          id?: string
          name?: string
          reminder_time?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_jobs: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at: string
          days_of_week: number[] | null
          earnings: number
          frequency: Database["public"]["Enums"]["frequency"]
          id: string
          name: string
          payment_day: number | null
          time_slots: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at?: string
          days_of_week?: number[] | null
          earnings: number
          frequency: Database["public"]["Enums"]["frequency"]
          id?: string
          name: string
          payment_day?: number | null
          time_slots?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["wheel_of_life_category"]
          created_at?: string
          days_of_week?: number[] | null
          earnings?: number
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          name?: string
          payment_day?: number | null
          time_slots?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          amount: number | null
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completed_at: string | null
          created_at: string
          description: string | null
          end_date: string | null
          financial_type: Database["public"]["Enums"]["financial_type"] | null
          goal_id: string | null
          id: string
          routine_job_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          time_spent: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: Database["public"]["Enums"]["wheel_of_life_category"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          financial_type?: Database["public"]["Enums"]["financial_type"] | null
          goal_id?: string | null
          id?: string
          routine_job_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          time_spent?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: Database["public"]["Enums"]["wheel_of_life_category"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          financial_type?: Database["public"]["Enums"]["financial_type"] | null
          goal_id?: string | null
          id?: string
          routine_job_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          time_spent?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_routine_job_id_fkey"
            columns: ["routine_job_id"]
            isOneToOne: false
            referencedRelation: "routine_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      financial_type: "spend" | "earn_once" | "earn_routine"
      frequency: "daily" | "weekly" | "monthly"
      goal_type: "annual" | "quarterly" | "financial"
      task_status: "not_started" | "in_progress" | "postponed" | "done"
      wheel_of_life_category:
        | "career"
        | "finance"
        | "health"
        | "family"
        | "personal"
        | "spiritual"
        | "social"
        | "education"
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
      financial_type: ["spend", "earn_once", "earn_routine"],
      frequency: ["daily", "weekly", "monthly"],
      goal_type: ["annual", "quarterly", "financial"],
      task_status: ["not_started", "in_progress", "postponed", "done"],
      wheel_of_life_category: [
        "career",
        "finance",
        "health",
        "family",
        "personal",
        "spiritual",
        "social",
        "education",
      ],
    },
  },
} as const
