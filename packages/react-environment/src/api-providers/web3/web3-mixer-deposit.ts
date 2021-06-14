import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { DepositPayload as IDepositPayload, MixerDeposit, MixerSize } from '@webb-dapp/react-environment/webb-context';

import { WebbWeb3Provider } from './webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';

type DepositPayload = IDepositPayload<EvmNote, [Deposit, number]>;

export class Web3MixerDeposit extends MixerDeposit<WebbWeb3Provider, DepositPayload> {
  async deposit(depositPayload: DepositPayload, contractName: string = 'nativeAnchor'): Promise<void> {
    transactionNotificationConfig.loading?.({
      address: '',
      data: undefined,
      key: 'mixer-deposit-evm',
      path: {
        method: 'deposit',
        section: 'evm-mixer',
      },
    });
    const [deposit, amount] = depositPayload.params;
    const contract = await this.inner.getContract(amount, contractName);
    await contract.deposit(deposit.commitment);
    transactionNotificationConfig.finalize?.({
      address: '',
      data: undefined,
      key: `deposit success`,
      path: {
        method: 'deposit',
        section: 'evm-mixer',
      },
    });
  }

  // this id is the contract id
  async generateNote(mixerId: string, contractName: string = 'nativeAnchor'): Promise<DepositPayload> {
    const contract = await this.inner.getContractWithAddress(mixerId);
    const storages = await this.inner.chainStorage;
    const mixerSize = storages[contractName].contractsAddresses.find((config) => config.address === mixerId);
    if (!mixerSize) {
      throw new Error(`mixer size  not found on this contract`);
    }

    const depositPayload = await contract.createDeposit();
    console.log(depositPayload);
    return {
      note: depositPayload.note,
      params: [depositPayload.deposit, mixerSize.size],
    };
  }

  async getSizes(contract: string = 'nativeAnchor'): Promise<MixerSize[]> {
    const storage = await this.inner.chainStorage;
    return storage[contract].mixerSize;
  }
}
