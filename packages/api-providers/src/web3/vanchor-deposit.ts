// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { CircomUtxo, Keypair, Note, NoteGenInput, toFixedHex, Utxo } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { DepositPayload as IDepositPayload, MixerSize, VAnchorDeposit, WithdrawState } from '../abstracts';
import {
  ChainType,
  chainTypeIdToInternalId,
  computeChainIdType,
  evmIdIntoInternalChainId,
  parseChainIdType,
} from '../chains';
import {
  BridgeStorage,
  bridgeStorageFactory,
  fetchVariableAnchorKeyForEdges,
  fetchVariableAnchorWasmForEdges,
  getAnchorDeploymentBlockNumber,
  getEVMChainNameFromInternal,
  keypairStorageFactory,
  Web3Provider,
} from '..';
import { WebbWeb3Provider } from './webb-provider';

type DepositPayload = IDepositPayload<Note, [Utxo, number | string, string?]>;

export class Web3VAnchorDeposit extends VAnchorDeposit<WebbWeb3Provider, DepositPayload> {
  // For VAnchor, the getSizes will describe the minimum deposit amount for the vanchor
  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;

    if (currency) {
      return anchors
        .filter((anchor) => !anchor.amount)
        .map((anchor) => ({
          // Hardcoded minimum size
          amount: 0.00001,
          asset: currency.view.symbol,
          id: `Bridge=${anchor.amount}@${currency.view.name}`,
          title: `${anchor.amount} ${currency.view.name}`,
        }));
    }

    return [];
  }

  async generateBridgeNote(
    anchorId: string | number,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);

    // TODO: Find a better way to manage keypair
    const keypairStorage = await keypairStorageFactory();
    const storedKeypair = await keypairStorage.get('keypair');

    let keypair: Keypair;

    if (storedKeypair) {
      // If keypair was already in storage, use it
      keypair = new Keypair(storedKeypair.keypair);
    } else {
      // Otherwise, create a new keypair and store it
      keypair = new Keypair();
      await keypairStorage.set('keypair', { keypair: keypair.privkey });
    }

    // Convert the amount to units of wei
    const depositOutputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: ethers.utils.parseEther(amount.toString()).toString(),
      chainId: destination.toString(),
      keypair,
    });

    const srcChainInternal = evmIdIntoInternalChainId(sourceEvmId);
    const destChainInternal = chainTypeIdToInternalId(parseChainIdType(destination));
    const anchorConfig = bridge.anchors.find((anchorConfig) => anchorConfig.type === 'variable');

    if (!anchorConfig) {
      throw new Error(`cannot find anchor configuration with amount: ${amount}`);
    }

    const srcAddress = anchorConfig.anchorAddresses[srcChainInternal];
    const destAddress = anchorConfig.anchorAddresses[destChainInternal];

    const noteInput: NoteGenInput = {
      amount: amount.toString(),
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      secrets: [
        toFixedHex(destination, 8).substring(2),
        toFixedHex(depositOutputUtxo.amount).substring(2),
        toFixedHex(keypair.privkey).substring(2),
        depositOutputUtxo.blinding,
      ].join(':'),
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress!,
      targetChain: destination.toString(),
      targetIdentifyingData: destAddress!,
      tokenSymbol: tokenSymbol,
      version: 'v2',
      width: '4',
    };

    const note = await Note.generateNote(noteInput);

    return {
      note: note,
      params: [depositOutputUtxo, anchorId, wrappableAssetAddress],
    };
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    try {
      const note = depositPayload.note.note;
      const utxo = depositPayload.params[0];

      const amount = depositPayload.params[0].amount;

      const sourceEvmId = await this.inner.getChainId();
      const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);
      const sourceInternalId = evmIdIntoInternalChainId(sourceEvmId);

      this.inner.notificationHandler({
        data: {
          amount: note.amount,
          chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
          currency: currency.view.name,
        },
        description: 'Depositing',
        key: 'bridge-deposit',
        level: 'loading',
        message: `bridge:${depositPayload.params[2] ? 'wrap and deposit' : 'deposit'}`,
        name: 'Transaction',
      });

      const anchors = await this.bridgeApi.getAnchors();

      // Find the only configurable VAnchor
      const vanchor = anchors.find((anchor) => !anchor.amount);

      if (!vanchor) {
        throw new Error('No variable anchor configured for token');
      }

      // Get the contract address for the destination chain
      const srcAddress = vanchor.neighbours[sourceInternalId] as string;

      if (!srcAddress) {
        throw new Error(`No Anchor for the chain ${note.targetChainId}`);
      }

      const srcVAnchor = await this.inner.getVariableAnchorByAddress(srcAddress);
      const maxEdges = await srcVAnchor._contract.maxEdges();

      // Fetch the fixtures
      this.emit('stateChange', WithdrawState.FetchingFixtures);
      const smallKey = await fetchVariableAnchorKeyForEdges(maxEdges, true);
      const smallWasm = await fetchVariableAnchorWasmForEdges(maxEdges, true);
      const leavesMap: Record<string, Uint8Array[]> = {};

      // Fetch the leaves from the source chain
      this.emit('stateChange', WithdrawState.FetchingLeaves);
      let leafStorage = await bridgeStorageFactory(Number(sourceChainId));

      // check if we already cached some values.
      let storedContractInfo: BridgeStorage[0] = (await leafStorage.get(srcAddress.toLowerCase())) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(Number(sourceChainId), srcAddress) || 0,
        leaves: [] as string[],
      };

      let leavesFromChain = await srcVAnchor.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      // Only populate the leaves map if there are actually leaves to populate.
      if (leavesFromChain.newLeaves.length != 0 || storedContractInfo.leaves.length != 0) {
        leavesMap[sourceChainId.toString()] = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves].map(
          (leaf) => {
            return hexToU8a(leaf);
          }
        );
      }

      // Set up a provider for the dest chain
      const destChainTypeId = parseChainIdType(Number(utxo.chainId));
      const destInternalId = evmIdIntoInternalChainId(destChainTypeId.chainId);
      const destChainConfig = this.config.chains[destInternalId];
      const destHttpProvider = Web3Provider.fromUri(destChainConfig.url);
      const destEthers = destHttpProvider.intoEthersProvider();
      const destAddress = vanchor.neighbours[destInternalId] as string;
      const destVAnchor = await this.inner.getVariableAnchorByAddressAndProvider(destAddress, destEthers);
      leafStorage = await bridgeStorageFactory(Number(utxo.chainId));

      // check if we already cached some values.
      storedContractInfo = (await leafStorage.get(destAddress.toLowerCase())) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(Number(utxo.chainId), destAddress) || 0,
        leaves: [] as string[],
      };

      leavesFromChain = await destVAnchor.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      // Only populate the leaves map if there are actually leaves to populate.
      if (leavesFromChain.newLeaves.length != 0 || storedContractInfo.leaves.length != 0) {
        leavesMap[utxo.chainId] = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves].map((leaf) => {
          return hexToU8a(leaf);
        });
      }

      this.emit('stateChange', WithdrawState.GeneratingZk);

      // If a wrappableAsset was selected, perform a wrapAndDeposit
      if (depositPayload.params[2]) {
        const requiredApproval = await destVAnchor.isWrappableTokenApprovalRequired(depositPayload.params[2], amount);

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          const tokenInstance = await ERC20Factory.connect(
            depositPayload.params[2],
            this.inner.getEthersProvider().getSigner()
          );
          const webbToken = await srcVAnchor.getWebbToken();
          const tx = await tokenInstance.approve(webbToken.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await srcVAnchor.hasEnoughBalance(
          depositPayload.params[0].amount,
          depositPayload.params[2]
        );

        if (enoughBalance) {
          const tx = await srcVAnchor.wrapAndDeposit(
            depositPayload.params[2],
            depositPayload.params[0] as CircomUtxo,
            leavesMap,
            smallKey,
            Buffer.from(smallWasm)
          );

          this.emit('stateChange', WithdrawState.SendingTransaction);

          // emit event for waiting for transaction to confirm
          await tx.wait();

          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });

          this.emit('stateChange', WithdrawState.Done);
        } else {
          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });
          this.emit('stateChange', WithdrawState.Failed);
        }

        return;
      } else {
        const requiredApproval = await srcVAnchor.isWebbTokenApprovalRequired(amount);

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          const tokenInstance = await srcVAnchor.getWebbToken();
          const tx = await tokenInstance.approve(srcVAnchor.inner.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await srcVAnchor.hasEnoughBalance(amount);

        if (enoughBalance) {
          const tx = await srcVAnchor.deposit(
            depositPayload.params[0] as CircomUtxo,
            leavesMap,
            smallKey,
            Buffer.from(smallWasm)
          );

          this.emit('stateChange', WithdrawState.SendingTransaction);

          // emit event for waiting for transaction to confirm
          await tx.wait();

          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name} deposit`,
            name: 'Transaction',
          });

          this.emit('stateChange', WithdrawState.Done);
        } else {
          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: 'Not enough token balance',
            name: 'Transaction',
          });

          this.emit('stateChange', WithdrawState.Failed);
        }
      }
    } catch (e: any) {
      console.log(e);

      if (e?.code === 4001) {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'user rejected deposit',
          key: 'bridge-deposit',
          level: 'error',
          message: `${currency.view.name}:deposit`,
          name: 'Transaction',
        });
        this.emit('stateChange', WithdrawState.Failed);
      } else {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'Deposit Transaction Failed',
          key: 'bridge-deposit',
          level: 'error',
          message: `${currency.view.name}:deposit`,
          name: 'Transaction',
        });
        this.emit('stateChange', WithdrawState.Failed);
      }
    }
  }
}
