import { Contract, providers, Signer } from 'ethers';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { GovernedTokenWrapper } from '@webb-dapp/contracts/types/GovernedTokenWrapper';
import { GovernedTokenWrapper__factory } from '@webb-dapp/contracts/types/factories/GovernedTokenWrapper__factory';
import { LoggerService } from '@webb-tools/app-util';

const logger = LoggerService.get('WebbGovernedToken');

export class WebbGovernedToken {
  private _contract: GovernedTokenWrapper;
  private readonly signer: Signer;

  constructor(
    private mixersInfo: EvmChainMixersInfo,
    private web3Provider: providers.Web3Provider,
    address: string,
    useProvider = false
  ) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = new Contract(
      address,
      GovernedTokenWrapper__factory.abi,
      useProvider ? this.web3Provider : this.signer
    ) as any;
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

  async wrap(address: string, amount: number) {
    return this._contract.wrap(address, amount);
  }

  get currentLiquidity() {
    return this._contract.totalSupply();
  }

  async canUnwrap(address: string, amount: number) {
    const currentLiquidity = await this.currentLiquidity;
    return currentLiquidity.lte(amount);
  }
}
