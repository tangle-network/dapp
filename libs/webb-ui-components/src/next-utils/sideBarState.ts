'use server';

import { cookies } from 'next/headers';
import { SIDEBAR_OPEN_KEY } from '../constants';

export const setSideBarCookieOnToggle = () => {
  const sideBarStateFromCookie = cookies().get(SIDEBAR_OPEN_KEY);

  if (sideBarStateFromCookie?.value === 'false') {
    cookies().set(SIDEBAR_OPEN_KEY, 'true');
  } else {
    cookies().set(SIDEBAR_OPEN_KEY, 'false');
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
