import Feature from '../lib/feature'
import Permission from '../lib/permission'
import Role from '../lib/role'

export type ListMap = Map<string, Array<string>>

export interface RBACData {
  permissions: Record<string, typeof Permission>
  roles: Record<string, typeof Role>
  features: typeof Feature[]
}

export type Action = string | number | Array<number | string>

export interface IOptions {
  permissions?: Array<Record<string, any>>
  roles?: Record<string, string>
  features?: Array<string>
  delimiter?: string
}
