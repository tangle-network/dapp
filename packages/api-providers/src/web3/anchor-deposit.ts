// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Anchor } from '@webb-tools/anchors';
import { LoggerService } from '@webb-tools/app-util';
// eslint-disable-next-line camelcase
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { Note, NoteGenInput, toFixedHex } from '@webb-tools/sdk-core';
import { GovernedTokenWrapper } from '@webb-tools/tokens';

import { AnchorDeposit, Currency, DepositPayload as IDepositPayload, MixerSize } from '../abstracts';
import {
  ChainType,
  ChainTypeId,
  chainTypeIdToInternalId,
  computeChainIdType,
  evmIdIntoInternalChainId,
  InternalChainId,
  internalChainIdIntoEVMId,
  parseChainIdType,
} from '../chains';
import { getEVMChainNameFromInternal } from '../';
import { WebbWeb3Provider } from './webb-provider';

const logger = LoggerService.get('web3-bridge-deposit');

type DepositPayload = IDepositPayload<Note, [IAnchorDepositInfo, number | string, string?]>;

export class Web3AnchorDeposit extends AnchorDeposit<WebbWeb3Provider, DepositPayload> {
  async deposit(depositPayload: DepositPayload): Promise<void> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    try {
      const commitment = depositPayload.params[0].commitment;
      const note = depositPayload.note.note;
      const sourceEvmId = await this.inner.getChainId();
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
      // Find the Anchor for this bridge amount
      const anchor = anchors.find((anchor) => anchor.amount === note.amount);

      if (!anchor) {
        throw new Error('not Anchor for amount' + note.amount);
      }

      // Get the contract address for the destination chain
      const contractAddress = anchor.neighbours[sourceInternalId];

      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${note.targetChainId}`);
      }

      const contract = this.inner.getFixedAnchorByAddress(contractAddress as string);

      // If a wrappableAsset was selected, perform a wrapAndDeposit
      if (depositPayload.params[2]) {
        const requiredApproval = await contract.isWrappableTokenApprovalRequired(depositPayload.params[2]);

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
          const webbToken = await contract.getWebbToken();
          const tx = await tokenInstance.approve(webbToken.address, await contract.getDenomination());

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await contract.hasEnoughBalance(depositPayload.params[2]);

        if (enoughBalance) {
          await contract.wrapAndDeposit(commitment, depositPayload.params[2]);

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
        }

        return;
      } else {
        const requiredApproval = await contract.isWebbTokenApprovalRequired();

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          const tokenInstance = await contract.getWebbToken();
          const tx = await tokenInstance.approve(contract.inner.address, await contract.getDenomination());

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await contract.hasEnoughBalance();

        if (enoughBalance) {
          await contract.deposit(commitment);
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
      } else {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'Deposit Transaction Failed',
          key: 'bridge-deposit',
          level: 'error',
          message: `${currency.view.name}:deposit`,
          name: 'Transaction',
        });
      }
    }
  }

  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;

    if (currency) {
      return anchors
        .filter((anchor) => anchor.amount)
        .map((anchor) => ({
          amount: Number(anchor.amount),
          asset: currency.view.symbol,
          id: `Bridge=${anchor.amount}@${currency.view.name}`,
          title: `${anchor.amount} ${currency.view.name}`,
        }));
    }

    return [];
  }

  async getWrappableAssets(chainId: InternalChainId): Promise<Currency[]> {
    const bridge = this.bridgeApi;

    logger.log('getWrappableAssets of chain: ', chainId);
    const chainIdType: ChainTypeId = {
      chainId: internalChainIdIntoEVMId(chainId),
      chainType: ChainType.EVM,
    };

    if (bridge) {
      const wrappedTokenAddress = bridge.getTokenAddress(chainIdType);

      if (!wrappedTokenAddress) {
        return [];
      }

      // Get the available token addresses which can wrap into the wrappedToken
      const wrappedToken = GovernedTokenWrapper.connect(
        wrappedTokenAddress,
        this.inner.getEthersProvider().getSigner()
      );
      const tokenAddresses = await wrappedToken.contract.getTokens();

      // TODO: dynamic wrappable assets - consider some Currency constructor via address & default token config.

      // If the tokenAddress matches one of the wrappableCurrencies, return it
      const wrappableCurrencyIds = this.config.chains[chainId].currencies.filter((currencyId) => {
        const wrappableTokenAddress = this.config.currencies[currencyId].addresses.get(chainId);

        return wrappableTokenAddress && tokenAddresses.includes(wrappableTokenAddress);
      });

      if (await wrappedToken.contract.isNativeAllowed()) {
        wrappableCurrencyIds.push(this.config.chains[chainId].nativeCurrencyId);
      }

      const wrappableCurrencies = wrappableCurrencyIds.map((currencyId) => {
        return Currency.fromCurrencyId(this.inner.config.currencies, currencyId);
      });

      return wrappableCurrencies;
    }

    return [];
  }

  /**
   * Generates a bridge note for the given mixer and target destination chain.
   * Note: If the wrappableAssetAddress is not provided, it is assumed to be
   *       the address of the webbToken
   * Note: This functione expects `destChainId` is EXPLICITLY the correctly computed
   *       target chain id with the type encoded in its value.
   * @param anchorID - the anchorID
   * @param destChainId - encoded destination chain Id and chain type
   * @param wrappableAssetAddress - the address of the token to wrap into the bridge
   * @returns
   */

  /*
   *
   *  Anchor id => the fixed deposit amount
   * destChainId => the Chain the token will be bridged to
   * If the wrappableAssetAddress is not provided, it is assumed to be the address of the webbToken
   **/
  async generateBridgeNote(
    anchorId: number | string,
    destChainId: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    const amount = String(anchorId).replace('Bridge=', '').split('@')[0];
    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);
    const deposit = Anchor.generateDeposit(destChainId);
    const srcChainInternal = evmIdIntoInternalChainId(sourceEvmId);
    const destChainInternal = chainTypeIdToInternalId(parseChainIdType(destChainId));
    const anchorConfig = bridge.anchors.find(
      (anchorConfig) => anchorConfig.type === 'fixed' && anchorConfig.amount === amount
    );

    if (!anchorConfig) {
      throw new Error(`cannot find anchor configuration with amount: ${amount}`);
    }

    const srcAddress = anchorConfig.anchorAddresses[srcChainInternal];
    const destAddress = anchorConfig.anchorAddresses[destChainInternal];

    const noteInput: NoteGenInput = {
      amount: amount,
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'anchor',
      secrets: `${toFixedHex(destChainId, 6).substring(2)}:${deposit.nullifier.toString(16)}:${deposit.secret.toString(
        16
      )}`,
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress!,
      targetChain: destChainId.toString(),
      targetIdentifyingData: destAddress!,
      tokenSymbol: tokenSymbol,
      version: 'v2',
      width: '4',
    };

    const note = await Note.generateNote(noteInput);

    return {
      note: note,
      params: [deposit, anchorId, wrappableAssetAddress],
    };
  }
}
