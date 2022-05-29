// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { Note } from '@webb-tools/sdk-core';

import { DepositPayload as IDepositPayload, MixerSize } from '../abstracts';
import { ChainType, computeChainIdType, evmIdIntoInternalChainId } from '../chains';
import { getEVMChainName, getEVMChainNameFromInternal } from '../';
import { Web3AnchorDeposit } from './anchor-deposit';

type DepositPayload = IDepositPayload<Note, [IAnchorDepositInfo, number | string, string?]>;

// The Web3 version of a mixer deposit is simply an anchor deposit where src and target chainID are the same.
export class Web3MixerDeposit extends Web3AnchorDeposit {
  // Override the deposit in AnchorDeposit to emit different notifications
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
          amount: String(Number(note.amount)),
          chain: getEVMChainName(this.inner.config, sourceEvmId),
          currency: note.tokenSymbol,
        },
        description: 'Depositing',
        key: 'mixer-deposit',
        level: 'loading',
        message: 'mixer deposit',
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
          const tx = await tokenInstance.approve(webbToken.address, await contract.denomination);

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
            key: 'mixer-deposit',
            level: 'success',
            message: `${currency.view.name} wrap and deposit`,
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
            key: 'mixer-deposit',
            level: 'error',
            message: `${currency.view.name} wrap and deposit`,
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
          const tx = await tokenInstance.approve(contract.inner.address, await contract.denomination);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await contract.hasEnoughBalance();

        if (enoughBalance) {
          await contract.deposit(commitment);
          this.inner.notificationHandler({
            description: 'Deposit succeed',
            key: 'mixer-deposit',
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
            key: 'mixer-deposit',
            level: 'error',
            message: `${currency.view.name} deposit`,
            name: 'Transaction',
          });
        }
      }
    } catch (e: any) {
      console.log(e);

      if (e?.code === 4001) {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'User Rejected Deposit',
          key: 'mixer-deposit',
          level: 'error',
          message: `${currency.view.name} deposit`,
          name: 'Transaction',
        });
      } else {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'Deposit Transaction Failed',
          key: 'mixer-deposit',
          level: 'error',
          message: `${currency.view.name} deposit`,
          name: 'Transaction',
        });
      }
    }
  }

  async generateNote(mixerId: string): Promise<DepositPayload> {
    const evmId = await this.inner.getChainId();
    const chainIdType = computeChainIdType(ChainType.EVM, evmId);
    const generatedNote = await this.generateBridgeNote(mixerId, chainIdType);

    return {
      note: generatedNote.note,
      params: generatedNote.params,
    };
  }

  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;

    if (currency) {
      return anchors.map((anchor) => ({
        amount: Number(anchor.amount),
        asset: currency.view.symbol,
        id: `Bridge=${anchor.amount}@${currency.view.name}`,
        title: `${anchor.amount} ${currency.view.name}`,
      }));
    }

    return [];
  }
}
