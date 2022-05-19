import { CurrencyLike } from '@webb-dapp/react-hooks/types';
// @ts-ignore
import { CurrencyId } from '@webb-tools/types/interfaces';

export type CurrencyChangeFN =
  | ((token: string) => void)
  | ((token: CurrencyId) => void)
  | ((token: CurrencyLike) => void);
