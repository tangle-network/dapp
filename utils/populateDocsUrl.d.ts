type TruncateTrailingSlash<Route extends `/${string}`> = Route extends `${infer Truncated}/` ? Truncated : Route;
declare function populateDocsUrl<T extends `/${string}`>(route: TruncateTrailingSlash<T>): `https://docs.webb.tools/${TruncateTrailingSlash<T>}`;
export default populateDocsUrl;
