import { Access } from '../types'

const Feature = function (
  name: string,
  resource: string,
  action: Access,
  version = ''
) {
  this.name = name
  this.resource = resource
  this.action = action
  if (version) this.version = version
}

export default Feature
