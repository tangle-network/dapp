import { ChainType, computeChainIdType, InternalChainId } from '@webb-dapp/apps/configs';
import { DepositPayload as IDepositPayload, MixerSize } from '@webb-dapp/react-environment';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers/polkadot/webb-polkadot-provider';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { BridgeApi } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';

import { u8aToHex } from '@polkadot/util';

import { BridgeDeposit } from '../../webb-context/bridge/bridge-deposit';

type DepositPayload = IDepositPayload<Note, [number, string]>;

export class PolkadotBridgeDeposit extends BridgeDeposit<WebbPolkadot, DepositPayload> {
  async deposit(depositPayload: DepositPayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        section: 'anchorBn254',
        method: 'deposit',
      },
      depositPayload.params
    );
    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const hash = await tx.call(account.address);
    return;
  }

  async generateBridgeNote(
    mixerId: number | string,
    destination: number,
    wrappableAssetAddress: string | undefined
  ): Promise<DepositPayload> {
    const currency = this.bridgeApi.currency;

    if (!currency) {
      throw new Error('api not ready');
    }
    const tokenSymbol = currency.view.symbol;
    const destChainId = destination;
    // TODO: add mappers similar to evm chain id
    const chainId = this.inner.api.registry.chainSS58!;
    const sourceChainId = computeChainIdType(ChainType.Substrate, chainId);
    const anchorPath = String(mixerId).replace('Bridge=', '').split('@');
    const amount = anchorPath[0];
    const anchorIndex = anchorPath[2];
    const anchors = await this.bridgeApi.getAnchors();
    const anchor = anchors[Number(anchorIndex)];
    console.log({
      amount,
      anchorIndex,
      anchor,
      anchors,
      sourceChainId,
      destination,
      mixerId,
    });
    const treeId = anchor.neighbours[InternalChainId.WebbDevelopment] as number; // TODO: Anchor in one chain the 0 id contains the treeId
    const noteInput: NoteGenInput = {
      exponentiation: '5',
      width: '4',
      prefix: 'webb.anchor',
      chain: String(destChainId),
      sourceChain: String(sourceChainId),
      amount: amount,
      denomination: '18',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      backend: 'Arkworks',
      version: 'v1',
      tokenSymbol: tokenSymbol,
    };
    console.log(noteInput);
    const note = await Note.generateNote(noteInput);
    const leaf = note.getLeaf();
    return {
      note,
      params: [treeId, u8aToHex(leaf)],
    };
  }

  private get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<WebbPolkadot, BridgeConfig>;
  }

  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;
    if (currency) {
      return anchors.map((anchor, anchorIndex) => ({
        id: `Bridge=${anchor.amount}@${currency.view.name}@${anchorIndex}`,
        title: `${anchor.amount} ${currency.view.name}`,
      }));
    }
    return [];
  }
}
