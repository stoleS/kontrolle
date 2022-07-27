import { createName } from './helpers'

/**
 * Single feature object
 */
export function Feature (action: string, resource: string, delimiter: string) {
  const name = createName(action, resource, delimiter)

  return { name }
}
