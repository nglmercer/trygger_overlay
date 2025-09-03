
/**
 * Type guard to check if value is a string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard to check if value is a function
 */
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

/**
 * Type guard to check if value is an async function
 */
export const isAsyncFunction = (value: unknown): value is Function => {
  return isFunction(value) && value.constructor.name === 'AsyncFunction';
};

/**
 * Type guard to check if value is a generator function
 */
export const isGeneratorFunction = (value: unknown): value is GeneratorFunction => {
  return isFunction(value) && value.constructor.name === 'GeneratorFunction';
};

/**
 * Type guard to check if value is a promise
 */
export const isPromise = <T = any>(value: unknown): value is Promise<T> => {
  return value instanceof Promise;
};

/**
 * Type guard to check if value is an URL
 */
export const isURL = (value: unknown): value is URL => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
