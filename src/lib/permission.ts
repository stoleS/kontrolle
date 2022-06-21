const Permission = function (
  group: string,
  resource: string,
  action: number,
  version = '',
  delimiter: string
): typeof Permission {
  this.name = this.createName(group, resource, delimiter)
  this.group = group
  this.resource = resource
  this.action = action
  if (version) this.version = version
}

Permission.prototype.createName = function (
  group: string,
  resource: string,
  delimiter: string
) {
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

Permission.prototype.can = function (
  group: string,
  resource: string,
  action: number
): boolean {
  return (
    this.group === group && this.resource === resource && this.action === action
  )
}

export default Permission
