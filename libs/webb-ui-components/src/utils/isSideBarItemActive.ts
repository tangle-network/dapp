/**
 * Checks if the href or any of the hrefs in the array are active
 * @param hrefOrArrayOfHrefs the href or array of hrefs to check
 * @returns true if the href or any of the hrefs in the array are active
 */
function isSideBarItemActive(
  hrefOrArrayOfHrefs: string | Array<string>,
  pathnameOrHash?: string
): boolean {
  if (typeof pathnameOrHash === 'string' && pathnameOrHash.length > 0) {
    if (Array.isArray(hrefOrArrayOfHrefs)) {
      return hrefOrArrayOfHrefs.some(
        (href) =>
          href.length > 0 &&
          (pathnameOrHash.includes(href) || pathnameOrHash.includes(href))
      );
    } else {
      return pathnameOrHash.includes(hrefOrArrayOfHrefs);
    }
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const pathname = window?.location?.pathname;
  const hash = window?.location?.hash;

  if (!pathname && !hash) {
    return false;
  }

  if (typeof hrefOrArrayOfHrefs === 'string' && hrefOrArrayOfHrefs.length > 0) {
    return (
      pathname.includes(hrefOrArrayOfHrefs) || hash.includes(hrefOrArrayOfHrefs)
    );
  } else if (Array.isArray(hrefOrArrayOfHrefs)) {
    return hrefOrArrayOfHrefs.some(
      (href) =>
        href.length > 0 && (pathname.includes(href) || hash.includes(href))
    );
  }

  return false;
}

export default isSideBarItemActive;
