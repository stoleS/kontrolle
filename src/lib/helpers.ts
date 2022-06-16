export function isEmptyObject<T> (object: T): boolean {
  return Object.keys(object).length === 0 && object.constructor === Object
}

export function isEmptyArray<T> (array: T): boolean {
  return Array.isArray(array) && !array.length
}
