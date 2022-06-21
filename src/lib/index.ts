import { IOptions, ListMap, RBACData } from '../types'

import Feature from './feature'
import { isEmptyArray, isEmptyObject } from './helpers'
import Permission from './permission'
import Role from './role'

const DEFAULT_OPTIONS: IOptions = {
  permissions: {},
  roles: {},
  features: [],
  delimiter: ':'
}

function RBAC (options: IOptions) {
  this.options = { ...DEFAULT_OPTIONS, ...options }
  this.data = {}
}

RBAC.prototype.init = function () {
  const { roles, permissions, features } = this.options as IOptions

  if (isEmptyArray(roles)) {
    throw new Error('Roles are required')
  }

  this.data = { ...this.create(roles, permissions, features) }
}

/**
 * Create permissions and roles for initialization
 * @method RBAC#create
 * @param {Array<string>} roleNames List of role names
 * @param {ListMap} permissionNames List of permission names
 */
RBAC.prototype.create = function (
  roles: Record<string, string>,
  permissions: ListMap,
  features: typeof Feature[]
): RBACData {
  const initializedData: RBACData = {} as RBACData

  initializedData.roles = this.createRoles(roles)

  if (permissions) {
    initializedData.permissions = this.createPermissions(permissions)
  }

  if (features) {
    initializedData.features = this.createFeatures(features)
  }

  return initializedData
}

/**
 * Create permissions from permission option parameter
 * @method RBAC#createFeatures
 * @param {ListMap} featuresData Object of features
 */
RBAC.prototype.createFeatures = function (
  featuresData: ListMap
): typeof Permission[] {
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
RBAC.prototype.createFeature = function (
  action: string,
  resource: string
): typeof Permission {
  return new Permission(action, resource, this.options.delimiter)
}

/**
 * Create roles from roles option parameter
 * @method RBAC#createRoles
 * @param {Array<string>} roleNames Array of role names
 */
RBAC.prototype.createRoles = function (
  rolesData: Record<string, string>
): Record<string, typeof Role> {
  const roles: Record<string, typeof Role> = {}

  for (const role in rolesData) {
    if (Object.prototype.hasOwnProperty.call(rolesData, role)) {
      const rawRole = rolesData[role]
      const parsedRole = this.createRole(rawRole)
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
RBAC.prototype.createRole = function (name: string): typeof Role {
  return new Role(name)
}

/**
 * Create features from roles option parameter
 * @method RBAC#createFeatures
 * @param {Array<string>} featureNames Array of feature objects
 */
RBAC.prototype.createPermissions = function (
  permissionsData: Array<Record<string, any>>
): Record<string, typeof Permission> {
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
            const parsedPermission = this.createPermission(
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
RBAC.prototype.createPermission = function (
  group: string,
  resource: string,
  permission: Record<string, number | string>
): typeof Permission {
  return new Permission(
    group,
    resource,
    permission.action as number,
    permission.version as string,
    this.options.delimiter
  )
}

/**
 * Check if role exists
 * @method RBAC#hasRole
 * @param {String} name Name of the role
 * @return {Role}       Instance of the Role
 */
RBAC.prototype.hasRole = function (name: string): typeof Role | boolean {
  const role = this.data.roles[name]

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
RBAC.prototype.can = function (
  group: string,
  resource: string,
  action: number
) {
  for (const permissionKey in this.data.permissions) {
    if (
      Object.prototype.hasOwnProperty.call(this.data.permissions, permissionKey)
    ) {
      const permission = this.data.permissions[permissionKey]
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
RBAC.prototype.canAll = function (
  permissions: Array<Record<any, any>>
): boolean {
  let found = 0

  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i]
    const { group, resource, action } = permission
    const can = this.can(group, resource, action)

    if (can) found++
  }

  return found === permissions.length
}

/**
 * Check if user can perform any provided actions over any provided features
 * @method RBAC#canAny
 * @param {Array<Record<any, any>>} permissions List of permissions to check
 * @return {boolean}
 */
RBAC.prototype.canAny = function (
  permissions: Array<Record<any, any>>
): boolean {
  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i]
    const { group, resource, action } = permission
    const can = this.can(group, resource, action)

    if (can) return true
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
RBAC.prototype.hasFeature = function (group: string, resource: string) {
  const name = Feature.createName(group, resource, this.options.delimiter)
  const feature = this.data.features[name]

  if (!feature) return false

  return feature
}

export default RBAC
