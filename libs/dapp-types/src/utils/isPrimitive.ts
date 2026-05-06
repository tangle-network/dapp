import type { Primitive } from './types';

/**
 * Check if a value is a primitive type.
 * @param value the value to check if it is a primitive
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
export default function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null || (typeof value !== 'object' && typeof value !== 'function')
  );
}
