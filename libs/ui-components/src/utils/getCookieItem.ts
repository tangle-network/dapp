/**
 * Get the value of a cookie item
 * @param itemKey The key of the item that we want to get the value
 * @returns The value of the cookie item
 */
const getCookieItem = (itemKey: string) => {
  // Based on https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#example_2_get_a_sample_cookie_named_test2
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${itemKey}=`))
    ?.split('=')[1];
};

export default getCookieItem;
