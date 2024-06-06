const entriesOf = <Key extends string | number | symbol, Value>(
  object: Record<Key, Value>,
): [Key, Value][] => {
  // Type cast is needed because `Object.entries()` returns `[string, Value][]`,
  // in other words, it unfortunately downgrades the key type to `string` by
  // default.
  return Object.keys(object).map((key) => [key as Key, object[key as Key]]);
};

export default entriesOf;
