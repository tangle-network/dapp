import { CurrencyLike } from '@webb-dapp/react-hooks/types';
import { CurrencyId } from '@webb-tools/types/interfaces';

export type CurrencyChangeFN =
  | ((token: string) => void)
  | ((token: CurrencyId) => void)
  | ((token: CurrencyLike) => void);
