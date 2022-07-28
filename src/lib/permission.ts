import { createName, isArray } from './helpers';

/**
 * Single permission object
 * @param {string} group
 * @param {string} resource
 * @param {string | string[]} action
 * @param {string} version
 * @param {string} delimiter
 * @return {Record<string, any>}
 */
export function Permission(
  group: string,
  resource: string,
  action: string | string[],
  version = '',
  delimiter: string
): Record<string, any> {
  const _group = group;
  const _resource = resource;
  const _action = isArray(action) ? [...action] : action;
  const _version = version;

  /**
   * Evaluate single action
   * @param {String} group    Feature group
   * @param {String} resource Feature
   * @param {String} action   Action to evaluate
   * @return {Boolean}
   */
  const can = (group: string, resource: string, action: string): boolean => {
    return (
      _group === group && _resource === resource && _action.includes(action)
    );
  };

  /**
   * Evaluate multiple actions
   * @param {String[]} actions     List of actions to evaluate
   */
  const canActions = (actions: string[]) => {
    let found = 0;
    actions.forEach((action) => _action.includes(action) && found++);
    return found;
  };

  const _name = createName(group, resource, delimiter);

  return {
    name: _name,
    group: _group,
    resource: _resource,
    action: _action,
    version: _version,
    can,
    canActions,
  };
}
