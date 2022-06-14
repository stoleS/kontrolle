import Permission from './Permission'
import Role from './Role'

type ListMap = Map<string, Array<string>>

interface RBACData {
  permissions: typeof Permission[]
  roles: typeof Role[]
}

interface IOptions {
  permissions?: ListMap
  roles?: Array<string>
  delimiter?: string
}

const DEFAULT_OPTIONS: IOptions = {
  permissions: new Map(),
  roles: [],
  delimiter: ':'
}

const RBAC = function (options: IOptions) {
  this.options = { ...DEFAULT_OPTIONS, ...options }
}

RBAC.prototype.init = function () {
  const { roles, permissions } = this.options
  this.create(roles, permissions)
}

/**
 * Create permissions and roles for initialization
 * @method RBAC#create
 * @param {Array<string>} roleNames List of role names
 * @param {ListMap} permissionNames List of permission names
 */
RBAC.prototype.create = function (
  roleNames: Array<string>,
  permissionNames: ListMap
): RBACData {
  const initializedData: RBACData = {} as RBACData

  initializedData.permissions = this.createPermissions(permissionNames)
  initializedData.roles = this.createRoles(roleNames)

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

  Object.keys(permissionsData).map(resource => {
    const actions = permissionsData.get(resource)

    actions &&
      actions.map(action => {
        const permission = this.createPermission(action, resource)
        initializedPermissions[permission.name] = permission
      })
  })

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
  return new Permission(action, resource)
}

/**
 * Create roles from roles option parameter
 * @method RBAC#createRoles
 * @param {Array<string>} roleNames Array of role names
 */
RBAC.prototype.createRoles = function (
  rolesData: Array<string>
): Record<string, typeof Role> {
  const roles: Record<string, typeof Role> = {}

  rolesData.map(roleName => {
    const role = this.createRole(roleName)

    roles[role.name] = role
  })

  return roles
}

/**
 * Create a new role object
 * @method RBAC#createRole
 * @param {String} roleName Name of new Role
 * @return {Role}           Instance of the Role
 */
RBAC.prototype.createRole = (name: string): typeof Role => {
  return new Role(name)
}

export default RBAC
