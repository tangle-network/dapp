/**
 * Parse JSON string and return error if any
 * @param str - The JSON string to parse
 * @returns [error, parsed]
 */

const parseJson = (str: string) => {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    return [err];
  }
};

export default parseJson;
