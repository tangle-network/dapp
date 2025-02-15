type JsonObject = {
  [x: string]: Json;
};

type JsonArray = Json[];

export type Json =
  | null
  | undefined
  | string
  | number
  | bigint
  | boolean
  | JsonObject
  | {}
  | JsonArray;

const JSONStringifyBigInt = (data: Json, space?: string | number): string => {
  if (!data) return JSON.stringify(data);

  const bigInts = /([[:])?"(-?\d+)n"([,}\]])/g;

  const preliminaryJSON = JSON.stringify(
    data,
    (_, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value),
    space,
  );

  const finalJSON = preliminaryJSON.replace(bigInts, '$1$2$3');

  return finalJSON;
};

export default JSONStringifyBigInt;
