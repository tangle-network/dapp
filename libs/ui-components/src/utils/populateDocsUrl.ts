import { WEBB_DOCS_URL } from '../constants';

type TruncateTrailingSlash<Route extends `/${string}`> =
  Route extends `${infer Truncated}/` ? Truncated : Route;

function populateDocsUrl<T extends `/${string}`>(
  route: TruncateTrailingSlash<T>,
) {
  return `${WEBB_DOCS_URL}${route}` as const;
}

export default populateDocsUrl;
