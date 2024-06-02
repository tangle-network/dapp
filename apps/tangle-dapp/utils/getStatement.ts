export interface Statement {
  sentence: string;
  url: string;
}

function getPolkadot(isRegularStatement?: boolean | null): Statement | null {
  if (isRegularStatement === null || isRegularStatement === undefined) {
    return null;
  }

  const url = isRegularStatement
    ? 'https://statement.polkadot.network/regular.html'
    : 'https://statement.polkadot.network/saft.html';
  const hash = isRegularStatement
    ? 'Qmc1XYqT6S39WNp2UeiRUrZichUWUPpGEThDE6dAb3f6Ny'
    : 'QmXEkMahfhHJPzT3RjkXiZVFi77ZeVeuxtAjhojGRNYckz';

  return {
    sentence: `I hereby agree to the terms of the statement whose SHA-256 multihash is ${hash}. (This may be found at the URL: ${url})`,
    url,
  };
}

function getTangle(isRegularStatement?: boolean | null): Statement | null {
  if (isRegularStatement === null || isRegularStatement === undefined) {
    return null;
  }

  const url = isRegularStatement
    ? 'https://statement.tangle.tools/airdrop-statement.html'
    : 'https://statement.tangle.tools/safe-claim-statement';

  const hash = isRegularStatement
    ? '5627de05cfe235cd4ffa0d6375c8a5278b89cc9b9e75622fa2039f4d1b43dadf'
    : '7eae145b00c1912c8b01674df5df4ad9abcf6d18ea3f33d27eb6897a762f4273';

  return {
    sentence: `I hereby agree to the terms of the statement whose sha2256sum is ${hash}. (This may be found at the URL: ${url})`,
    url,
  };
}

function getStatement(
  network: string,
  isRegularStatement?: boolean | null,
): Statement | null {
  if (network === 'Polkadot' || network === 'Polkadot CC1') {
    return getPolkadot(isRegularStatement);
  }

  if (
    network.toLowerCase().includes('tangle') ||
    network.toLowerCase().includes('local')
  ) {
    return getTangle(isRegularStatement);
  }

  return null;
}

export default getStatement;
