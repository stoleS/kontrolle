const Feature = function (
  group: string,
  resource: string,
  access: number,
  version = '',
  delimiter: string
): typeof Feature {
  this.name = this.createName(group, resource, delimiter)
  this.group = group
  this.resource = resource
  this.access = access
  if (version) this.version = version
}

Feature.prototype.createName = function (
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

Feature.prototype.can = function (
  group: string,
  resource: string,
  access: number
): boolean {
  return (
    this.group === group && this.resource === resource && this.access >= access
  )
}

export default Feature
