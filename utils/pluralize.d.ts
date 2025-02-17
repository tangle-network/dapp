declare const pluralize: <T extends string>(value: T, condition: boolean) => T | `${T}s`;
export default pluralize;
