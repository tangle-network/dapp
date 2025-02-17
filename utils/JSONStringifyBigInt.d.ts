type JsonObject = {
    [x: string]: Json;
};
type JsonArray = Json[];
export type Json = null | undefined | string | number | bigint | boolean | JsonObject | {} | JsonArray;
declare const JSONStringifyBigInt: (data: Json, space?: string | number) => string;
export default JSONStringifyBigInt;
