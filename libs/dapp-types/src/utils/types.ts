/** T or `undefined` */
export type Maybe<T> = T | undefined;

/** T or `null` */
export type Nullable<T> = T | null;

/**
 * @description Combines members of an intersection into a readable type.
 *
 * @see {@link https://x.com/mattpocockuk/status/1622730173446557697}
 * @example
 * Prettify<{ a: string } & { b: string } & { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Evaluate<type> = { [key in keyof type]: type[key] } & unknown;

/**
 * OmitByValue
 * @description From `T` remove a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 *
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type Props = OmitByValue<Props, number>;
 *   // Expect: { opt?: string; }
 *   type Props = OmitByValue<Props, number | undefined>;
 */
export type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;

/**
 * JS primitive types
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * `MappedObjectType`: Transforms an object type into a union of objects, each containing a single property from the original object.
 * This type takes an object type `T` and maps each of its properties to a new object type where the key is the same, but the value is wrapped in an object.
 *
 * Example:
 * If you have an object type `Person`:
 * ```
 * type Person = {
 *   name: string;
 *   age: number;
 * };
 * ```
 * Using `MappedObjectType<Person>` will produce the union type:
 * ```
 * { name: string; } | { age: number; }
 * ```
 */
export type MappedObjectType<T extends Record<string, unknown>> = {
  [K in keyof T]: { [P in K]: T[K] };
}[keyof T];
