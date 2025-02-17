/**
 * Checks if the href or any of the hrefs in the array are active
 * @param hrefOrArrayOfHrefs the href or array of hrefs to check
 * @returns true if the href or any of the hrefs in the array are active
 */
declare function isSideBarItemActive(hrefOrArrayOfHrefs: string | Array<string>, pathnameOrHash?: string): boolean;
export default isSideBarItemActive;
