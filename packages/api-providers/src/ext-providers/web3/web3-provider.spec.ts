// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai';

import { Web3Provider } from './web3-provider';

describe('Initialize Web3', () => {
  it('Is constructable from HTTP', async () => {
    const web3Provider = Web3Provider.fromUri('https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4');
    const isListening = await web3Provider.eth.net.isListening();

    expect(isListening).to.equal(true);
  });
});
