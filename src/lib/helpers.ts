/**
 * Check if object is empty
 * @param object 
 * @returns {Boolean}
 */
export function isEmptyObject<T>(object: T): boolean {
  return Object.keys(object).length === 0 && object.constructor === Object;
}

/**
 * Check if array is empty
 * @param array 
 * @returns {Boolean}
 */
export function isEmptyArray<T>(array: T): boolean {
  return Array.isArray(array) && !array.length;
}

/**
 * Check if variable is an array
 * @param array
 * @returns {Boolean}
 */
export function isArray<T>(variable: T) {
  return Array.isArray(variable);
}

/**
 * Encode element name based on group and resource
 * @param {String} group
 * @param {String} resource
 * @param {String} delimiter
 * @returns {String}
 */
export const createName = (
  group: string,
  resource: string,
  delimiter: string
) => {
  if (!delimiter) {
    throw new Error('Delimiter is not defined');
  }

  if (!group) {
    throw new Error('Action is not defined');
  }

  if (!resource) {
    throw new Error('Resource is not defined');
  }
  return `${group}${delimiter}${resource}`;
};

/**
 * Decode element name from group and resource
 * @param {String} name
 * @param {String} delimiter
 * @returns {Record<String, String>}
 */
export const decodeName = (
  name: string,
  delimiter: string
): Record<string, string> => {
  if (!delimiter) {
    throw new Error('Delimiter is required');
  }

  if (!name) {
    throw new Error('Name is required');
  }

  const pos = name.indexOf(delimiter);
  if (pos === -1) {
    throw new Error('Wrong name');
  }

  return {
    action: name.substring(0, pos),
    resource: name.substring(pos + 1),
  };
};
