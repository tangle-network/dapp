import { Share } from '@acala-network/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces';

import { useCall } from './useCall';
import { useAccounts } from './useAccounts';
import { CurrencyLike } from './types';

interface DexShareData {
  share: Share | undefined;
  totalShares: Share | undefined;
}

export const useDexShare = (token: CurrencyLike, account?: AccountId | string): DexShareData => {
  const { active } = useAccounts();
  const _account = account || (active ? active.address : '');
  const share = useCall<Share>('query.dex.shares', [token, _account]);
  const totalShares = useCall<Share>('query.dex.totalShares', [token]);

  return { share, totalShares };
};
