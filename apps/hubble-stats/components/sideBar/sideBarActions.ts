'use server';

import { cookies } from 'next/headers';
import { SIDEBAR_OPEN_KEY } from '@webb-tools/webb-ui-components/src/constants';

export const setSideBarCookieOnToggle = () => {
  const sideBarStateFromCookie = cookies().get(SIDEBAR_OPEN_KEY);

  if (sideBarStateFromCookie?.value === 'true') {
    cookies().set(SIDEBAR_OPEN_KEY, 'false');
  } else {
    cookies().set(SIDEBAR_OPEN_KEY, 'true');
  }
};

export const getSideBarStateFromCookie = () => {
  const sideBarStateFromCookie = cookies().get(SIDEBAR_OPEN_KEY);

  return sideBarStateFromCookie === undefined
    ? undefined
    : sideBarStateFromCookie.value === 'true'
    ? true
    : false;
};
