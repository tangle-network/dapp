// @ts-ignore
import { CurrencyId } from '@webb-tools/protocol-substrate-types/interfaces';
import { CurrencyLike } from '@webb-dapp/react-hooks/types';

export type CurrencyChangeFN =
  | ((token: string) => void)
  | ((token: CurrencyId) => void)
  | ((token: CurrencyLike) => void);
