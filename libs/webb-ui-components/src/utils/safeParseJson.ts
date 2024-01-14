/**
 * Parse JSON string and return error if any
 * @param jsonString - The JSON string to parse
 * @returns an `Error` instance if the JSON string is invalid, otherwise the parsed JSON
 */
function safeParseJson<T extends string | number | unknown[] | Record<string, unknown> | boolean | null>(jsonString: string): T | Error {
  try {
    return JSON.parse(jsonString);
  } catch (possibleError) {
    if (possibleError instanceof Error) {
      return possibleError;
    }

    return new Error(
      `Unknown error because the thrown value (a ${typeof possibleError}) is not an instance of an error`
    );
  }
};

export default safeParseJson;
