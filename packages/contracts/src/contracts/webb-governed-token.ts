import { Contract, providers, Signer } from 'ethers';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { GovernedTokenWrapper } from '@webb-dapp/contracts/types/GovernedTokenWrapper';
import { GovernedTokenWrapper__factory } from '@webb-dapp/contracts/types/factories/GovernedTokenWrapper__factory';
import { LoggerService } from '@webb-tools/app-util';

const logger = LoggerService.get('WebbGovernedToken');

export class WebbGovernedToken {
  private _contract: GovernedTokenWrapper;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = new Contract(address, GovernedTokenWrapper__factory.abi, this.web3Provider) as any;
  }

  get tokens() {
    return this._contract.getTokens();
  }

  async getInfo() {
    const [symbol, name] = await Promise.all([this._contract.symbol(), this._contract.name()]);
    return {
      symbol,
      name,
    };
  }

  getBalanceOf(account: string) {
    return this._contract.balanceOf(account);
  }

  /// todo assume native
  async wrap(address: string, amount: number) {
    return this._contract.wrap(address, amount);
  }

  async unwrap(address: string, amount: number) {
    return this._contract.wrap(address, amount);
  }

  get currentLiquidity() {
    return this._contract.totalSupply();
  }

  async canUnwrap(account: string, amount: number) {
    const [currentWrappedLiquidity, currentNativeLiquidity] = await Promise.all([
      this.currentLiquidity,
      this.web3Provider.getBalance(this._contract.address),
    ]);
    if (currentWrappedLiquidity.lt(amount) || currentWrappedLiquidity.lt(amount)) {
      // no enough liquidity
      return false;
    }

    const userBalance = await this._contract.balanceOf(account);
    if (userBalance.gte(amount)) return true;

    return false;
  }

  private isNativeAllowed() {
    return true;
  }
  async canWrap(/*tokenAddress: string*/ amount: number) {
    /*    const tokens = await this._contract.getTokens();
    if (!tokens.includes(tokenAddress)) {
      return false;
    }*/
    return this.isNativeAllowed();
  }
}
