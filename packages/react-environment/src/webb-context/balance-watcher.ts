import { WebbCurrencyId } from '@webb-dapp/apps/configs';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface Token {
  type: 'native-token' | 'wrapped-token';
  id: WebbCurrencyId | string;
}

type BalanceId = string;

export function balanceOf(accountOrContract: string, assetId: Token): BalanceId {
  return `${accountOrContract}${assetId.type === 'native-token' ? ':::' : '::'}${String(assetId)}`;
}

export function accountAndToken(balanceOfId: BalanceId): [string, Token] {
  const isNative = balanceOfId.indexOf(':::') > -1;
  const [account, asset] = balanceOfId.split(isNative ? ':::' : '::');
  return [
    account,
    {
      type: isNative ? 'native-token' : 'wrapped-token',
      id: isNative ? Number(asset) : asset,
    },
  ];
}

export type BalanceEvent = {
  key: BalanceId;
  accountId: string;
  asset: Token;
  balance: string;
};

type BalanceSource = 'GovernedTokenWrapper' | 'Web3Provider' | 'SubstrateApi';
abstract class BalanceGetter {
  constructor(public readonly source: BalanceSource) {}

  public isValidFor(balanceId: BalanceId) {
    const [_, token] = accountAndToken(balanceId);
  }
}

export abstract class BalanceWatcher<T = any> {
  private accounts: Map<string, boolean> = new Map();
  private balancesStorage: Map<BalanceId, [string, boolean]> = new Map();
  private emitter = new Subject<BalanceEvent>();

  protected abstract inner: T;

  protected async getBalanceOf(balanceId: BalanceId): Promise<string | undefined> {
    // value is ready
    if (this.balancesStorage.has(balanceId)) {
      const [balance, watching] = this.balancesStorage.get(balanceId)!;
      if (watching) {
        return balance;
      }
    }
  }

  protected $balanceOf(balanceId: BalanceId) {
    return this.emitter.pipe(filter((e) => e.key === balanceId));
  }

  protected $balancesOfAccounts(accountIds: string[]): Observable<[string, Token, string]> {
    return this.emitter.pipe(
      filter((e) => accountIds.includes(e.accountId)),
      map((a) => [a.accountId, a.asset, a.balance])
    );
  }

  private setBalance(balanceId: BalanceId, balance: string, watching: boolean) {
    const [accountId, asset] = accountAndToken(balanceId);
    this.accounts.set(accountId, true);
    this.balancesStorage.set(balanceId, [balance, watching]);
    this.emitter.next({
      balance,
      asset,
      accountId,
      key: balanceId,
    });
  }
}
