import type { Database } from './database'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type Shift = Database['public']['Tables']['shifts']['Row']
export type ShiftAssignment = Database['public']['Tables']['shift_assignments']['Row']
export type ShiftRequest = Database['public']['Tables']['shift_requests']['Row']

export type Role = 'admin' | 'staff'
export type ShiftStatus = 'draft' | 'published'
export type RequestType = 'available' | 'unavailable' | 'preferred_time'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
