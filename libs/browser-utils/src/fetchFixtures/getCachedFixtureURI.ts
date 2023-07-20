/**
 * Get the URI for a cached fixture.
 */
function getCachedFixtureURI(fileName: string) {
  return `/solidity-fixtures/solidity-fixtures/${fileName}`;
}

export default getCachedFixtureURI;
