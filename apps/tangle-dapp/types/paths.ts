import { DelegationsAndPayoutsTab } from '../containers/DelegationsPayoutsContainer/DelegationsPayoutsContainer';

export enum PagePath {
  Nomination = '/',
  ClaimAirdrop = '/claim',
  Account = '/account',
}

export enum QueryParamKey {
  DelegationsAndPayoutsTab = 'tab',
}

export type QueryParamKeyOf<Page extends PagePath> =
  Page extends PagePath.Nomination
    ? QueryParamKey.DelegationsAndPayoutsTab
    : never;

export type QueryParamValueOf<Key extends QueryParamKey> =
  Key extends QueryParamKey.DelegationsAndPayoutsTab
    ? DelegationsAndPayoutsTab
    : never;

/**
 * Utility type to remove trailing slash from a string.
 *
 * This is useful for constructing query param paths, as the
 * root path (`/`) should not have a trailing slash, but all
 * other paths should.
 */
type RemoveTrailingSlash<T extends string> = T extends `${infer U}/` ? U : T;

/**
 * Utility type to construct a query param path from a page path
 * and query param key/value in a strongly statically typed way.
 */
type SearchQueryPathOf<
  Page extends PagePath,
  Key extends QueryParamKeyOf<Page>,
  Value extends QueryParamValueOf<Key>
> = `${RemoveTrailingSlash<Page>}/?${Key}=${Value}`;

/**
 * Enum-like constant object containing the different paths
 * static search query key & value paths that can be linked to
 * directly.
 *
 * All paths are constructed using the {@link SearchQueryPathOf} utility
 * type, which ensures that the query param key and value are
 * statically typed and match the query param key and value types
 * for the given page.
 *
 * For example, `/account?tab=overview`.
 */
export const StaticSearchQueryPath: {
  NominationsTable: SearchQueryPathOf<
    PagePath.Nomination,
    QueryParamKey.DelegationsAndPayoutsTab,
    DelegationsAndPayoutsTab.Nominations
  >;
  PayoutsTable: SearchQueryPathOf<
    PagePath.Nomination,
    QueryParamKey.DelegationsAndPayoutsTab,
    DelegationsAndPayoutsTab.Payouts
  >;
} = {
  NominationsTable: `${PagePath.Nomination}?${QueryParamKey.DelegationsAndPayoutsTab}=${DelegationsAndPayoutsTab.Nominations}`,
  PayoutsTable: `${PagePath.Nomination}?${QueryParamKey.DelegationsAndPayoutsTab}=${DelegationsAndPayoutsTab.Payouts}`,
} as const;

export type InternalPath =
  | PagePath
  | (typeof StaticSearchQueryPath)[keyof typeof StaticSearchQueryPath];
