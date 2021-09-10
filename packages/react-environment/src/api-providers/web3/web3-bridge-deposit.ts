import { ChainId, evmIdIntoChainId, webbCurrencyIdToString } from '@webb-dapp/apps/configs';
import { createDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { BridgeConfig, DepositPayload as IDepositPayload, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer';
import { BridgeDeposit } from '../../webb-context/bridge/bridge-deposit';
import { u8aToHex } from '@polkadot/util';

type DepositPayload = IDepositPayload<Note, [Deposit, number | string]>;

export class Web3BridgeDeposit extends BridgeDeposit<WebbWeb3Provider, DepositPayload> {
  bridgeConfig: BridgeConfig = {};

  deposit(depositPayload: DepositPayload): Promise<void> {
    return Promise.resolve(undefined);
  }

  async getSizes(): Promise<MixerSize[]> {
    const bridge = this.activeBridge;
    if (bridge) {
      return bridge.anchors.map((anchor) => ({
        id: `Bridge=${anchor.amount}@${bridge.currency.name}`,
        title: `${anchor.amount} ${bridge.currency.prefix}`,
      }));
    }
    return [];
  }

  /*
   *
   *  Mixer id => the fixed deposit amount
   * destChainId => the Chain the token will be bridged to
   * */
  async generateBridgeNote(mixerId: number | string, destChainId: ChainId): Promise<DepositPayload> {
    const bridge = this.activeBridge;
    if (!bridge) {
      throw new Error('api not ready');
    }
    const currencyId = bridge.currency.currencyId;
    const tokenSymbol = webbCurrencyIdToString(currencyId);
    const activeChainEvmId = await this.inner.getChainId();
    const sourceChainId = evmIdIntoChainId(activeChainEvmId);
    const deposit = createDeposit();
    const secrets = deposit.preimage;
    const noteInput: NoteGenInput = {
      prefix: 'webb.mix',
      chain: String(destChainId),
      amount: String(mixerId),
      denomination: '18',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      backend: 'Circom',
      version: 'v1',
      tokenSymbol: tokenSymbol,
      secrets: u8aToHex(secrets),
    };
    const note = await Note.generateNote(noteInput);
    return {
      note: note,
      params: [deposit, mixerId],
    };
  }
}
