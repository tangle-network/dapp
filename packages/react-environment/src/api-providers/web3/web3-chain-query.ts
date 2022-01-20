import { chainsConfig, evmIdIntoChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { ERC20__factory } from '@webb-dapp/contracts/types';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import { ChainQuery } from '@webb-dapp/react-environment/webb-context/chain-query';
import { ethers } from 'ethers';

export class Web3ChainQuery extends ChainQuery<WebbWeb3Provider> {
  constructor(protected inner: WebbWeb3Provider) {
    super(inner);
  }

  async tokenBalanceByCurrencyId(currencyId: WebbCurrencyId): Promise<string> {
    const provider = this.inner.getEthersProvider();

    // check if the token is the native token of this chain
    const { chainId: evmId } = await provider.getNetwork();
    const webbChain = evmIdIntoChainId(evmId);

    const accounts = await this.inner.accounts.accounts();
    if (!accounts || !accounts.length) {
      console.log('no account selected');
      return '';
    }
    // Return the balance of the account if native currency
    if (chainsConfig[webbChain].nativeCurrencyId == currencyId) {
      const tokenBalanceBig = await provider.getBalance(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);
      return tokenBalance;
    } else {
      // Find the currency address on this chain
      const currency = Currency.fromCurrencyId(currencyId);
      const currencyOnChain = currency.getAddress(webbChain);
      if (!currencyOnChain) return '';

      // Create a token instance for this chain
      const tokenInstance = ERC20__factory.connect(currencyOnChain, provider);
      const tokenBalanceBig = await tokenInstance.balanceOf(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);
      return tokenBalance;
    }
  }

  async tokenBalanceByAddress(address: string): Promise<string> {
    const provider = this.inner.getEthersProvider();

    const accounts = await this.inner.accounts.accounts();
    if (!accounts || !accounts.length) {
      console.log('no account selected');
      return '';
    }

    // Return the balance of the account if native currency
    if (address === '0x0000000000000000000000000000000000000000') {
      const tokenBalanceBig = await provider.getBalance(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);
      return tokenBalance;
    } else {
      // Create a token instance for this chain
      const tokenInstance = ERC20__factory.connect(address, provider);
      const tokenBalanceBig = await tokenInstance.balanceOf(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);
      return tokenBalance;
    }
  }
}
