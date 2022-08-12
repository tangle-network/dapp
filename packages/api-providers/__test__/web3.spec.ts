// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { startGanacheServer } from '@webb-tools/test-utils';
import { getChainIdType } from '@webb-tools/utils';
import { ethers } from 'ethers';

import { Web3RelayerManager, WebbRelayerManagerFactory } from '..';
import { Web3Provider, WebbWeb3Provider } from '../';
import { mockAppConfig } from './utils/mock-config';
import mockNotificationHandler from './utils/mock-notification-handler';

describe.skip('Note provider interactions', () => {
  let provider: WebbWeb3Provider;
  const testPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const chainId = getChainIdType(9999);

  before(async () => {
    const server = await startGanacheServer(9999, 9999, [
      {
        balance: ethers.utils.parseEther('1000').toHexString(),
        secretKey: testPrivateKey,
      },
    ]);

    console.log(server.status);

    const web3Provider = Web3Provider.fromUri('http://localhost:9999');

    const relayerFactory = await WebbRelayerManagerFactory.init(
      [
        {
          endpoint: 'http://localhost:9955',
        },
      ],
      (name, basedOn) => {
        console.log(name, basedOn);

        return null;
      }
    );

    const relayerManager = (await relayerFactory.getRelayerManager('evm')) as Web3RelayerManager;
    const workerFactory = () => {
      return null;
    };

    provider = await WebbWeb3Provider.init(
      web3Provider,
      9999,
      relayerManager,
      null,
      mockAppConfig,
      mockNotificationHandler,
      workerFactory
    );
  });

  it('should generate a note for the variable anchor', async () => {
    const testGeneratedNote = await provider.methods.variableAnchor.deposit.inner.generateBridgeNote('', chainId, 2);

    console.log(testGeneratedNote.note.serialize());
    // const parsedNote = await testGeneratedNote.note.toDepositNote();
  });
});
