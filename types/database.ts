export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'staff'
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'staff'
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'staff'
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          staff_code: string
          full_name: string
          email: string | null
          phone: string | null
          qr_token: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          staff_code: string
          full_name: string
          email?: string | null
          phone?: string | null
          qr_token: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          staff_code?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          qr_token?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          organization_id: string
          shift_date: string
          start_time: string | null
          end_time: string | null
          required_staff: number | null
          notes: string | null
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          shift_date: string
          start_time?: string | null
          end_time?: string | null
          required_staff?: number | null
          notes?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          shift_date?: string
          start_time?: string | null
          end_time?: string | null
          required_staff?: number | null
          notes?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          shift_id: string
          staff_id: string
          start_time: string | null
          end_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          staff_id: string
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          staff_id?: string
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_requests: {
        Row: {
          id: string
          organization_id: string
          staff_id: string
          shift_id: string | null
          request_date: string
          request_type: 'available' | 'unavailable' | 'preferred_time'
          preferred_start_time: string | null
          preferred_end_time: string | null
          notes: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          staff_id: string
          shift_id?: string | null
          request_date: string
          request_type: 'available' | 'unavailable' | 'preferred_time'
          preferred_start_time?: string | null
          preferred_end_time?: string | null
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          staff_id?: string
          shift_id?: string | null
          request_date?: string
          request_type?: 'available' | 'unavailable' | 'preferred_time'
          preferred_start_time?: string | null
          preferred_end_time?: string | null
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
