'use server';

import { cookies } from 'next/headers';

export async function setSideBarCookieOnToggle() {
  const currentSideBarState = cookies().get('isSidebarOpen');

  if (
    currentSideBarState !== undefined &&
    currentSideBarState.value === 'false'
  ) {
    cookies().set('isSidebarOpen', 'true');
  } else {
    cookies().set('isSidebarOpen', 'false');
  }
}
