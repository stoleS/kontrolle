const Permission = (
  group: string,
  resource: string,
  action: number,
  version = '',
  delimiter: string
): typeof Permission => {
  const _group = group
  const _resource = resource
  const _action = action
  const _version = version

  const createName = (group: string, resource: string, delimiter: string) => {
    if (!delimiter) {
      throw new Error('Delimiter is not defined')
    }

    if (!group) {
      throw new Error('Action is not defined')
    }

    if (!resource) {
      throw new Error('Resource is not defined')
    }
    return `${group}${delimiter}${resource}`
  }

  const can = (group: string, resource: string, action: number): boolean => {
    return _group === group && _resource === resource && _action === action
  }

  const _name = createName(group, resource, delimiter)

  return {
    name: _name,
    group: _group,
    resource: _resource,
    action: _action,
    version: _version,
    can
  }
}

export default Permission
