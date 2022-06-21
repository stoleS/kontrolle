const Feature = function (
  action: string,
  resource: string,
  delimiter: string,
  excluded = false,
  version = ''
): typeof Feature {
  this.name = this.createName(action, resource, delimiter, excluded, version)
  this.action = action
  this.resource = resource

  if (excluded) this.excluded = excluded
  if (version) this.type = version
}

/**
 * Compute name of permission from action and resource
 * @function createName
 * @memberof Permission
 * @param {String} action    Name of permission
 * @param {String} resource  Resource of permission
 * @param {String} delimiter delimiter
 * @return {String}          Computed name of permission
 * @static
 */
Feature.prototype.createName = function (
  action: string,
  resource: string,
  delimiter: string
): string {
  if (!delimiter) {
    throw new Error('Delimiter is not defined')
  }

  if (!action) {
    throw new Error('Action is not defined')
  }

  if (!resource) {
    throw new Error('Resource is not defined')
  }

  return `${resource}${delimiter}${action}`
}

/**
 * Compute destructured action and resource name from permission name
 * @function decodeName
 * @memberof Permission
 * @param {String} action    Computed name of permission
 * @param {String} delimiter delimiter
 * @return {Object}          Destructured action and resource name
 * @static
 */
Feature.prototype.decodeName = function (
  name: string,
  delimiter: string
): Record<string, string> {
  if (!delimiter) {
    throw new Error('Delimiter is required')
  }

  if (!name) {
    throw new Error('Name is required')
  }

  const pos = name.indexOf(delimiter)
  if (pos === -1) {
    throw new Error('Wrong name')
  }

  return {
    action: name.substring(0, pos),
    resource: name.substring(pos + 1)
  }
}

export default Feature
