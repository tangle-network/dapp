import { depositFromPreimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

import { BridgeWithdraw } from '../../webb-context';
import { ChainId } from '@webb-dapp/apps/configs';

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = bridgeConfig;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    ///--->
    const parseNote = await Note.deserialize(note);
    ///--->
    const deposit = depositFromPreimage(parseNote.note.secret.replace('0x', ''));
    const token = parseNote.note.tokenSymbol;
    const bridgeCurrency = BridgeCurrency.fromString(token);
    const bridge = Bridge.from(this.bridgeConfig, bridgeCurrency);
    const anchor = bridge.anchors.find((anchor) => anchor.amount == parseNote.note.amount);
    if (!anchor) {
      throw new Error('not Anchor for amount' + parseNote.note.chain);
    }
    const contractAddress = anchor.anchorAddresses[Number(parseNote.note.chain) as ChainId];
    if (!contractAddress) {
      throw new Error(`No Anchor for the chain ${parseNote.note.chain}`);
    }
    const contract = this.inner.getWebbAnchorByAddress(contractAddress);
    const accounts = await this.inner.accounts.accounts();
    console.log(accounts);
    const zkpResults = await contract.generateZKP(deposit, {
      destinationChainId: Number(parseNote.note.chain),
      fee: 0,
      nullifier: deposit.nullifier,
      recipient: accounts[0].address,
      nullifierHash: deposit.nullifierHash,
      refund: 0,
      relayer: accounts[0].address,
      secret: deposit.secret,
    });
    await contract.withdraw(zkpResults.proof, zkpResults.proof);
    /*
     * TODO
     * - Generate ZKP based on the bridge circuit
     * - emit events for UI
     *  - submit transaction
     * */
  }
}
