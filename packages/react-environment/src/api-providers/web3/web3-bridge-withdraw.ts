import { depositFromPreimage } from '@webb-dapp/contracts/utils/make-deposit';
import { BridgeConfig, BridgeWithdraw } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = {};

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    const parseNote = await Note.deserialize(note);
    const deposit = depositFromPreimage(parseNote.note.secret.replace('0x', ''));
    /*
     * TODO
     * - Generate ZKP based on the bridge circuit
     * - emit events for UI
     *  - submit transaction
     * */
  }
}
