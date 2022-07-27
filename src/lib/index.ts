/** @module RBAC */

import { IOptions, RBACData } from '../types';

import { createName, isArray, isEmptyArray } from './helpers';
import { Permission } from './permission';
import { Role } from './role';

export const DEFAULT_OPTIONS: IOptions = {
  permissions: [],
  roles: {},
  features: [],
  delimiter: ':',
};

let initOptions: IOptions = {};

let data = {
  permissions: {} as Record<string, any>,
  features: {},
  roles: {},
};

/**
 * Initialize library with roles, permissions, features and additional options
 * @method RBAC#init
 * @param {IOptions} options Options needed for initialization
 */
export const init = (options: IOptions) => {
  initOptions = { ...DEFAULT_OPTIONS, ...options };
  const { roles, permissions, features } = initOptions as IOptions;

  if (isEmptyArray(roles)) {
    throw new Error('Roles are required');
  }

  data = { ...create(roles, permissions, features) };
};

/**
 * Transform provided roles, features and permissions to format
 * needed for evaluation methods
 * @method RBAC#create
 * @param {Array<string>} roleNames List of role names
 * @param {ListMap} permissionNames List of permission names
 */
export const create = (
  roles: Record<string, string>,
  permissions: Array<Record<string, any>>,
  features: Array<Record<string, Array<string>>>
): RBACData => {
  const initializedData: RBACData = {} as RBACData;

  initializedData.roles = createRoles(roles);

  if (permissions) {
    initializedData.permissions = createPermissions(permissions);
  }

  if (features) {
    initializedData.features = createFeatures(features);
  }

  return initializedData;
};

/**
 * Transform and initialize features
 * @method RBAC#createFeatures
 * @param {ListMap} featuresData Object of features
 */
export const createFeatures = (
  featuresData: Array<Record<string, Array<string>>>
) => {
  const initializedFeatures: any = {};

  for (const role in featuresData) {
    initializedFeatures[role] = [];
    if (Object.prototype.hasOwnProperty.call(featuresData, role)) {
      const features = featuresData[role];
      for (const group in features) {
        if (Object.prototype.hasOwnProperty.call(features, group)) {
          const feature = features[group];
          feature.forEach((resource) => {
            initializedFeatures[role].push(`${group}:${resource}`);
          });
        }
      }
    }
  }

  return initializedFeatures;
};

/**
 * Transform and initialize roles
 * @method RBAC#createRoles
 * @param {Record<string, string>} rolesData Array of role names
 */
export const createRoles = (
  rolesData: Record<string, string>
): Record<string, typeof Role> => {
  const roles: Record<string, any> = {};

  for (const role in rolesData) {
    if (Object.prototype.hasOwnProperty.call(rolesData, role)) {
      const rawRole = rolesData[role];
      const parsedRole = createRole(rawRole);
      roles[parsedRole.name] = parsedRole;
    }
  }

  return roles;
};

/**
 * Create a new role object
 * @method RBAC#createRole
 * @param {String} name Name of new Role
 * @return {Role}       Instance of the Role
 */
export const createRole = (name: string) => {
  return Role(name);
};

/**
 * Transform and initialize permissions
 * @method RBAC#createPermissions
 * @param {Array<Record<string, any>>} permissionsData Array of feature objects
 */
export const createPermissions = (
  permissionsData: Array<Record<string, any>>
): Record<string, typeof Permission> => {
  const permissions: Record<string, any> = {};

  permissionsData.forEach((permissionGroup) => {
    for (const group in permissionGroup) {
      if (Object.prototype.hasOwnProperty.call(permissionGroup, group)) {
        const permissionsList = permissionGroup[group];
        for (const permission in permissionsList) {
          if (
            Object.prototype.hasOwnProperty.call(permissionsList, permission)
          ) {
            const rawPermission = permissionsList[permission];
            const parsedPermission = createPermission(
              group,
              permission,
              rawPermission
            );

            if (
              rawPermission[parsedPermission.name] &&
              rawPermission[parsedPermission.name].action ===
                rawPermission.action
            )
              continue;

            permissions[parsedPermission.name] = parsedPermission;
          }
        }
      }
    }
  });

  return permissions;
};

/**
 * Create a new permission object
 * @method RBAC#createPermission
 * @param {String} group                      Permission group
 * @param {String} resource                   Permission name
 * @param {Record<string, string>} permission Permission options
 * @return {Permission}                       Instance of the Permission
 */
export const createPermission = (
  group: string,
  resource: string,
  permission: Record<string, string>
) => {
  return Permission(
    group,
    resource,
    permission.action,
    permission.version as string,
    initOptions.delimiter
  );
};

/**
 * Check if role exists
 * @method RBAC#hasRole
 * @param {String} name     Name of the role
 * @return {Role | boolean} Instance of the Role or false if role doesn't exist
 */
export const hasRole = (name: string): typeof Role | boolean => {
  let role;
  if (Object.prototype.hasOwnProperty.call(data.roles, name)) {
    role = data.roles[name];
    return role;
  }

  return false;
};

/**
 * Check if user can perform an action over the feature
 * @method RBAC#can
 * @param {String} group    Name of the group
 * @param {String} resource Name of the resource
 * @param {T} action        Action
 * @return {boolean}
 */
export const can = <T>(group: string, resource: string, action: T): boolean => {
  for (const permissionKey in data.permissions) {
    if (Object.prototype.hasOwnProperty.call(data.permissions, permissionKey)) {
      const permission = data.permissions[permissionKey];
      if (
        permission.can(group, resource, isArray(action) ? action[0] : action)
      ) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check if user has all provided features
 * @method RBAC#canAll
 * @param {Array<Record<any, any>>} permissions List of permissions to check
 * @return {boolean}
 */
export const canAll = (permissions: Array<Record<any, any>>): boolean => {
  let found = 0;

  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i];
    const { group, resource, action } = permission;
    const _can = can(group, resource, action);

    if (_can) found++;
  }

  return found === permissions.length;
};

/**
 * Check if user can perform any provided actions over any provided features
 * @method RBAC#canAny
 * @param {Array<Record<any, any>>} permissions List of permissions to check
 * @return {boolean}
 */
export const canAny = (permissions: Array<Record<any, any>>): boolean => {
  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i];
    const { group, resource, action } = permission;
    const _can = can(group, resource, action);

    if (_can) return true;
  }

  return false;
};

/**
 * Check if user can perform all provided actions over the feature
 * @method RBAC#canAllActions
 * @param {String} group    Name of the group
 * @param {String} resource Name of the resource
 * @param {String} actions     List of actions
 * @return {boolean}
 */
export const canAllActions = (
  group: string,
  resource: string,
  actions: string[]
): boolean => {
  const encodedName = createName(group, resource, initOptions.delimiter);
  let _can = 0;

  if (Object.prototype.hasOwnProperty.call(data.permissions, encodedName)) {
    _can = data.permissions[encodedName].canActions(actions);
  }

  return _can === actions.length ? true : false;
};

/**
 * Check if feature exists
 * @notExported
 * @method RBAC#hasFeature
 * @param {String} group    Name of the group
 * @param {String} resource Name of the resource
 * @return {Feature}        Instance of the Feature
 */
export const hasFeature = (group: string, resource: string) => {
  const name = createName(group, resource, initOptions.delimiter);
  const feature = data.features[name];

  if (!feature) return false;

  return feature;
};
