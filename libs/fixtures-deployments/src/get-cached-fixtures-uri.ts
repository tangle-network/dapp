// The cached fixture URI is defined in this fixtures-deployments package; however, the
// dapp-packages that build the entire dapp define the contents of this cached-fixtures/ folder.
export function getCachedFixtureURI(fileName: string) {
  return `/cached-fixtures/${fileName}`;
}
