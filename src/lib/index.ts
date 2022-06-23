import { IOptions, ListMap, RBACData } from '../types'

import Feature from './feature'
import { isEmptyArray, isEmptyObject } from './helpers'
import Permission from './permission'
import Role from './role'

const DEFAULT_OPTIONS: IOptions = {
  permissions: [],
  roles: {},
  features: [],
  delimiter: ':'
}

let initOptions: IOptions = {}

let data = {
  permissions: {},
  features: {},
  roles: {}
}

const init = (options: IOptions) => {
  initOptions = { ...DEFAULT_OPTIONS, ...options }
  const { roles, permissions, features } = initOptions as IOptions

  if (isEmptyArray(roles)) {
    throw new Error('Roles are required')
  }

  data = { ...create(roles, permissions, features) }

  console.log(data)
}

/**
 * Create permissions and roles for initialization
 * @method RBAC#create
 * @param {Array<string>} roleNames List of role names
 * @param {ListMap} permissionNames List of permission names
 */
const create = (
  roles: Record<string, string>,
  permissions: Array<Record<string, any>>,
  features: typeof Feature[]
): RBACData => {
  const initializedData: RBACData = {} as RBACData

  initializedData.roles = createRoles(roles)

  if (permissions) {
    initializedData.permissions = createPermissions(permissions)
  }

  if (features) {
    initializedData.features = createFeatures(features)
  }

  return initializedData
}

/**
 * Create permissions from permission option parameter
 * @method RBAC#createFeatures
 * @param {ListMap} featuresData Object of features
 */
const createFeatures = (
  featuresData: typeof Feature[]
): typeof Permission[] => {
  const initializedFeatures: any = {}

  for (const role in featuresData) {
    initializedFeatures[role] = []
    if (Object.prototype.hasOwnProperty.call(featuresData, role)) {
      const features = featuresData[role]
      for (const group in features) {
        if (Object.prototype.hasOwnProperty.call(features, group)) {
          const feature = features[group]
          feature.forEach(resource => {
            initializedFeatures[role].push(`${group}:${resource}`)
          })
        }
      }
    }
  }

  return initializedFeatures
}

/**
 * Create a new permission object
 * @method RBAC#createPermission
 * @param {String} action   Name of action
 * @param {String} resource Name of resource
 * @return {Permission}     Instance of the Permission
 */
const createFeature = (action: string, resource: string): typeof Permission => {
  return new Permission(action, resource, initOptions.delimiter)
}

/**
 * Create roles from roles option parameter
 * @method RBAC#createRoles
 * @param {Array<string>} roleNames Array of role names
 */
const createRoles = (
  rolesData: Record<string, string>
): Record<string, typeof Role> => {
  const roles: Record<string, typeof Role> = {}

  for (const role in rolesData) {
    if (Object.prototype.hasOwnProperty.call(rolesData, role)) {
      const rawRole = rolesData[role]
      const parsedRole = createRole(rawRole)
      roles[parsedRole.name] = parsedRole
    }
  }

  return roles
}

/**
 * Create a new role object
 * @method RBAC#createRole
 * @param {String} roleName Name of new Role
 * @return {Role}           Instance of the Role
 */
const createRole = (name: string): typeof Role => {
  return new Role(name)
}

/**
 * Create features from roles option parameter
 * @method RBAC#createFeatures
 * @param {Array<string>} featureNames Array of feature objects
 */
const createPermissions = (
  permissionsData: Array<Record<string, any>>
): Record<string, typeof Permission> => {
  const permissions: Record<string, typeof Permission> = {}

  permissionsData.forEach(permissionGroup => {
    for (const group in permissionGroup) {
      if (Object.prototype.hasOwnProperty.call(permissionGroup, group)) {
        const permissionsList = permissionGroup[group]
        for (const permission in permissionsList) {
          if (
            Object.prototype.hasOwnProperty.call(permissionsList, permission)
          ) {
            const rawPermission = permissionsList[permission]
            const parsedPermission = createPermission(
              group,
              permission,
              rawPermission
            )

            if (
              rawPermission[parsedPermission.name] &&
              rawPermission[parsedPermission.name].action ===
                rawPermission.action
            )
              continue

            permissions[parsedPermission.name] = parsedPermission
          }
        }
      }
    }
  })

  return permissions
}

/**
 * Create a new feature object
 * @method RBAC#createFeature
 * @param {String} featureName Name of new Feature
 * @return {Feature}           Instance of the Feature
 */
const createPermission = (
  group: string,
  resource: string,
  permission: Record<string, number | string>
): typeof Permission => {
  return Permission(
    group,
    resource,
    permission.action as number,
    permission.version as string,
    initOptions.delimiter
  )
}

/**
 * Check if role exists
 * @method RBAC#hasRole
 * @param {String} name Name of the role
 * @return {Role}       Instance of the Role
 */
const hasRole = (name: string): typeof Role | boolean => {
  const role = data.roles[name]

  if (!role) return false

  return role
}

/**
 * Check if user can perform an action over the feature
 * @method RBAC#can
 * @param {String} group    Name of the group
 * @param {String} resource Name of the resource
 * @param {Number} action   Action
 * @return {boolean}
 */
const can = (group: string, resource: string, action: number) => {
  for (const permissionKey in data.permissions) {
    if (Object.prototype.hasOwnProperty.call(data.permissions, permissionKey)) {
      const permission = data.permissions[permissionKey]
      if (permission.can(group, resource, action)) {
        return true
      }
    }
  }
  return false
}

/**
 * Check if user can perform all provided actions over all provided features
 * @method RBAC#canAll
 * @param {Array<Record<any, any>>} permissions List of permissions to check
 * @return {boolean}
 */
const canAll = (permissions: Array<Record<any, any>>): boolean => {
  let found = 0

  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i]
    const { group, resource, action } = permission
    const _can = can(group, resource, action)

    if (_can) found++
  }

  return found === permissions.length
}

/**
 * Check if user can perform any provided actions over any provided features
 * @method RBAC#canAny
 * @param {Array<Record<any, any>>} permissions List of permissions to check
 * @return {boolean}
 */
const canAny = (permissions: Array<Record<any, any>>): boolean => {
  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i]
    const { group, resource, action } = permission
    const _can = can(group, resource, action)

    if (_can) return true
  }

  return false
}

/**
 * Check if feature exists
 * @method RBAC#hasFeature
 * @param {String} group    Name of the group
 * @param {String} resource Name of the resource
 * @return {Feature}        Instance of the Feature
 */
const hasFeature = (group: string, resource: string) => {
  const name = Feature.createName(group, resource, initOptions.delimiter)
  const feature = data.features[name]

  if (!feature) return false

  return feature
}

const RBAC = {
  init,
  can,
  canAll,
  canAny,
  hasRole,
  hasFeature
}

export default RBAC
