import Feature from '../lib/feature'
import Permission from '../lib/permission'
import Role from '../lib/role'

export type ListMap = Map<string, Array<string>>

export enum Access {
  None,
  Create = 1 << 1,
  Read = 1 << 2,
  Update = 1 << 3,
  Delete = 1 << 4,
  All = ~(~0 << 5)
}

export interface RBACData {
  permissions: typeof Permission[]
  roles: typeof Role[]
  features: typeof Feature[]
}

export interface IOptions {
  permissions?: Record<string, Access>
  roles?: Array<string>
  features?: Array<string>
  scopes?: Access
  delimiter?: string
}
