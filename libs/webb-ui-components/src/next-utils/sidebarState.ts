'use server';

import { cookies } from 'next/headers';
import { SIDEBAR_OPEN_KEY } from '../constants';

export const setSidebarCookieOnToggle = () => {
  const sideBarStateFromCookie = cookies().get(SIDEBAR_OPEN_KEY);

  if (sideBarStateFromCookie?.value === 'false') {
    cookies().set(SIDEBAR_OPEN_KEY, 'true');
  } else {
    cookies().set(SIDEBAR_OPEN_KEY, 'false');
  }
};

export const getSidebarStateFromCookie = () => {
  const sidebarStateFromCookie = cookies().get(SIDEBAR_OPEN_KEY);

  return sidebarStateFromCookie === undefined
    ? undefined
    : sidebarStateFromCookie.value === 'true'
    ? true
    : false;
};
