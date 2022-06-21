import { IOptions, ListMap, RBACData } from '../types'

import Feature from './feature'
import { isEmptyArray, isEmptyObject } from './helpers'
import Permission from './permission'
import Role from './role'

const DEFAULT_OPTIONS: IOptions = {
  permissions: {},
  roles: {},
  features: [],
  scopes: 0,
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

  console.log(initializedData)

  return initializedData
}

/**
 * Create permissions from permission option parameter
 * @method RBAC#createPermissions
 * @param {ListMap} permissionsData Object of permissions
 */
RBAC.prototype.createPermissions = function (
  permissionsData: ListMap
): typeof Permission[] {
  const initializedPermissions: any = {}

  for (const role in permissionsData) {
    initializedPermissions[role] = []
    if (Object.prototype.hasOwnProperty.call(permissionsData, role)) {
      const permissions = permissionsData[role]
      for (const group in permissions) {
        if (Object.prototype.hasOwnProperty.call(permissions, group)) {
          const permission = permissions[group]
          permission.forEach(resource => {
            initializedPermissions[role].push(`${group}:${resource}`)
          })
        }
      }
    }
  }

  return initializedPermissions
}

/**
 * Create a new permission object
 * @method RBAC#createPermission
 * @param {String} action   Name of action
 * @param {String} resource Name of resource
 * @return {Permission}     Instance of the Permission
 */
RBAC.prototype.createPermission = function (
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
RBAC.prototype.createFeatures = function (
  featuresData: Array<Record<string, any>>
): Record<string, typeof Feature> {
  const features: Record<string, typeof Feature> = {}

  featuresData.forEach(featureGroup => {
    for (const group in featureGroup) {
      if (Object.prototype.hasOwnProperty.call(featureGroup, group)) {
        const featuresList = featureGroup[group]
        for (const feature in featuresList) {
          if (Object.prototype.hasOwnProperty.call(featuresList, feature)) {
            const rawFeature = featuresList[feature]
            const parsedFeature = this.createFeature(group, feature, rawFeature)

            if (
              features[parsedFeature.name] &&
              features[parsedFeature.name].access > rawFeature.access
            )
              continue

            features[parsedFeature.name] = parsedFeature
          }
        }
      }
    }
  })

  return features
}

/**
 * Create a new feature object
 * @method RBAC#createFeature
 * @param {String} featureName Name of new Feature
 * @return {Feature}           Instance of the Feature
 */
RBAC.prototype.createFeature = function (
  group: string,
  resource: string,
  feature: Record<string, number | string>
): typeof Feature {
  return new Feature(
    group,
    resource,
    feature.access as number,
    feature.version as string,
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

RBAC.prototype.can = function (
  group: string,
  resource: string,
  action: number
) {}

export default RBAC
