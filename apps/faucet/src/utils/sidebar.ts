import { SIDEBAR_OPEN_KEY } from '@webb-tools/webb-ui-components/constants';
import { getCookie, setCookie } from 'cookies-next';

/**
 * Set the sidebar state in the cookie on client side
 */
export const setSideBarCookieOnToggle = () => {
  const sideBarStateFromCookie = getCookie(SIDEBAR_OPEN_KEY);

  if (sideBarStateFromCookie === 'false') {
    setCookie(SIDEBAR_OPEN_KEY, 'true');
  } else {
    setCookie(SIDEBAR_OPEN_KEY, 'false');
  }
};

/**
 * Getting the sidebar state from the on server side to prevent hydration error
 * NOTE: this function only works on getServerSideProps according to cookies-next doc
 * @param options options required to get the cookie from the server
 * @returns the state of the sidebar that is stored in the cookie
 */
export function getSideBarStateFromCookie(
  options: Parameters<typeof getCookie>[1],
) {
  const sideBarStateFromCookie = getCookie(SIDEBAR_OPEN_KEY, options);
  return sideBarStateFromCookie === 'false' ? false : true;
}
