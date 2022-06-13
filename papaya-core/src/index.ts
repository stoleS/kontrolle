import Permission from './Permission';
import Role from './Role';

type ListMap = Map<string, Array<string>>;

interface RBACData {
  permissions: Permission[];
  roles: Role[];
} 

interface IOptions {
  permissions: ListMap
  roles: Array<string>
  delimiter: string
}

const DEFAULT_OPTIONS: IOptions = {
  permissions: new Map(),
  roles: [],
  delimiter: ':'
}

export default class RBAC {
  options: IOptions = { ...DEFAULT_OPTIONS }

  /**
   * RBAC constructor
   * @constructor RBAC
   * @param {IOptions} options              Options for RBAC
   * @param {Array<string>} [options.roles] List of role names (String)
   * @param {ListMap} [options.permissions] List of permissions
   * @param {String} options.delimiter      Delimiter
   */
  constructor (options: IOptions) {
    this.options = { ...options }
  }

  init () {
    const { roles, permissions} = this.options
    this.create(roles, permissions)
  }

  /**
   * Create permissions and roles for initialization
   * @method RBAC#create
   * @param {Array<string>} roleNames List of role names
   * @param {ListMap} permissionNames List of permission names
   */
  create (roleNames: Array<string>, permissionNames: ListMap): RBACData {
    const initializedData: RBACData = {} as RBACData;
    let {permissions, roles} = initializedData

    permissions = this.createPermissions(permissionNames)
    roles = this.createRoles(roleNames)

    return initializedData;
  }

  /**
   * Create permissions from permission option parameter
   * @method RBAC#createPermissions
   * @param {ListMap} permissionsData Object of permissions
   */
  createPermissions(permissionsData: ListMap): Permission[] {
    const initializedPermissions: any = {}

    Object.keys(permissionsData).map(resource => {
      const actions = permissionsData.get(resource);

      actions && actions.map(async (action) => {
        const permission = this.createPermission(action, resource);
        initializedPermissions[permission.name] = permission;
      });

    })

    return initializedPermissions;
  }

  /**
   * Create a new permission object
   * @method RBAC#createPermission
   * @param {String} action   Name of action
   * @param {String} resource Name of resource
   * @return {Permission}     Instance of the Permission
   */
  createPermission(action: string, resource: string): Permission {
    return new Permission(action, resource);
  }

  /**
   * Create roles from roles option parameter
   * @method RBAC#createRoles
   * @param {Array<string>} roleNames Array of role names
   */
  createRoles(rolesData: Array<string>): Role[] {
    const roles: any = {};

    rolesData.map(roleName => {
      const role = this.createRole(roleName);

      roles[role.name] = role;
    });

    return roles;
  };

  /**
   * Create a new role object
   * @method RBAC#createRole
   * @param {String} roleName Name of new Role
   * @return {Role}           Instance of the Role
   */
  createRole(name: string): Role {
    return new Role(name);
  }
}
