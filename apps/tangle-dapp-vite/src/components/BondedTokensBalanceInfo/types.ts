import { BN } from '@polkadot/util';

export type BondedTokensBalanceInfoProps = {
  type: 'unbonded' | 'unbonding';
  value: BN;
};
