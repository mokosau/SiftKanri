export const APP_NAME = 'シンプルシフト管理'
export const APP_DESCRIPTION = '5分で始められる、誰でも使えるシフト管理システム'

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const

export const SHIFT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export const REQUEST_TYPE = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  PREFERRED_TIME: 'preferred_time',
} as const

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
