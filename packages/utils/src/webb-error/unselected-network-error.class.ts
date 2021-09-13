import { WebbError, WebbErrorCodes } from './webb-error.class';
import { chainsPopulated } from '@webb-dapp/apps/configs';

type ChainIdentifier = {
  name: string;
  id: string | number;
};

export class UnselectedNetworkError extends WebbError {
  private activeChain: ChainIdentifier;
  private intendedChain: ChainIdentifier;
  public switchChain: () => any;

  constructor(activeChain: ChainIdentifier, intendedChain: ChainIdentifier, switchChain: () => any) {
    super(WebbErrorCodes.UnselectedChain);
    this.activeChain = activeChain;
    this.intendedChain = intendedChain;
    this.switchChain = switchChain;
  }

  getActiveChain() {
    return this.activeChain;
  }

  getIntendedChain() {
    return this.intendedChain;
  }
}
