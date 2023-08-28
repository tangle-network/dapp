/**
 * Validate a url is valid or not
 * @param url the url to check
 * @returns true if the url is valid, false otherwise
 */
function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default isValidUrl;
