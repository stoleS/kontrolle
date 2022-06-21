const Feature = function (
  group: string,
  resource: string,
  access: number,
  version = '',
  delimiter: string
): typeof Feature {
  this.name = `${group}${delimiter}${resource}`
  this.group = group
  this.resource = resource
  this.access = access
  if (version) this.version = version
}

export default Feature
