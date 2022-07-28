import { Permission } from '../lib/permission'
import { Role } from '../lib/role'

export type ListMap = Map<string, Array<string>>

/**
 * @internal Internal transformed data used for evaluations
 */
export interface RBACData {
  /** Transformed permissions object */
  permissions: Record<string, typeof Permission>
  /** Transformed roles object */
  roles: Record<string, typeof Role>
  /** Transformed features object */
  features: Array<Record<string, Array<string>>>
}

export type Action = string | number | Array<number | string>

/**
 * @internal Options used for initialization
 */
export interface IOptions {
  /** 
   * Initial permissions array
   * @example
   * ```
   * users: { manage: { action: ['create'] } }
   * ``` 
   * */
  permissions?: Array<Record<string, any>>
  /** 
   * Initial roles array
   * @example
   * ```
   * ['userAdmin', 'agencyAdmin']
   * ```
   * */
  roles?: Record<string, string>
  /** 
   * Initial features array
   * @example
   * ```
   * "agencyAdmin": { "agencies": [ "basic" ] }
   * ```
   * */
  features?: Record<string, Record<string, Array<string>>>
  /** Delimiter used for separating groups and resources */
  delimiter?: string
} 
