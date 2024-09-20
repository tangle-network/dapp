const pluralize = <T extends string>(
  value: T,
  condition: boolean,
): T | `${T}s` => {
  return condition ? `${value}s` : value;
};

export default pluralize;
