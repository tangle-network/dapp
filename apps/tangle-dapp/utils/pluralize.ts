const pluralize = <T extends string>(
  value: T,
  condition: boolean,
): T | `${T}s` => {
  return condition ? value : `${value}s`;
};

export default pluralize;
