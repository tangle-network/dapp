import { useState, useEffect } from 'react';

import { Fixed18, convertToFixed18 } from '@acala-network/app-util';
import { Balance, CollateralAuctionItem, DebitAuctionItem, SurplusAuctionItem } from '@acala-network/types/interfaces';
import { StorageKey, Option } from '@polkadot/types';
import { sortBy } from 'lodash';

import { useCall } from './useCall';
import { CurrencyLike, WithNull } from './types';
import { useApi } from './useApi';

export interface AuctionOverview {
  totalCollateral: { currency: CurrencyLike; balance: Fixed18 }[];
  totalDebit: Fixed18;
  totalSurplus: Fixed18;
  totalTarget: Fixed18;
}

export const useAuctionOverview = (): WithNull<AuctionOverview> => {
  const totalCollateralInAuction = useCall<[StorageKey, Balance][]>('query.auctionManager.totalCollateralInAuction.entries');
  const totalDebitInAuction = useCall<Balance>('query.auctionManager.totalDebitInAuction');
  const totalSurplusInAuction = useCall<Balance>('query.auctionManager.totalSurplusInAuction');
  const totalTargetInAuction = useCall<Balance>('query.auctionManager.totalTargetInAuction');
  const [result, setResult] = useState<WithNull<AuctionOverview>>(null);

  useEffect(() => {
    setResult({
      totalCollateral: totalCollateralInAuction ? totalCollateralInAuction.map((item) => {
        return {
          balance: convertToFixed18(item[1] || 0),
          currency: (item[0].toHuman() as string[])[0]
        };
      }) : [],
      totalDebit: convertToFixed18(totalDebitInAuction || 0),
      totalSurplus: convertToFixed18(totalSurplusInAuction || 0),
      totalTarget: convertToFixed18(totalTargetInAuction || 0)
    });
  }, [totalCollateralInAuction, totalDebitInAuction, totalSurplusInAuction, totalTargetInAuction]);

  return result;
};

export interface CollateralAuction {
  id: string;
  owner: string;
  currency: CurrencyLike;
  amount: Fixed18;
  target: Fixed18;
  startTime: number;
}

export const useCollateralAuctions = (): CollateralAuction[] => {
  const api = useApi();
  const [cacheKey, setCacheKey] = useState('');
  const collateralAuction = useCall<[StorageKey, Option<CollateralAuctionItem>][]>(
    'query.auctionManager.collateralAuctions.entries',
    [],
    {
      cacheKey
    }
  );
  const [result, setResult] = useState<CollateralAuction[]>([]);

  useEffect(() => {
    api.api.rpc.chain.subscribeNewHeads().subscribe((header) => {
      setCacheKey(header.number.toString());
    });
  }, [api]);

  useEffect(() => {
    if (!collateralAuction) return;
    const newResult = collateralAuction.map((item) => {
      return {
        amount: convertToFixed18(item[1].unwrap().amount || 0),
        currency: item[1].unwrap().currencyId?.toString(),
        id: (item[0].toHuman() as string[])[0].replace(/[^\d]/, ''),
        owner: (item[1].unwrap() as any).refundRecipient.toString(),
        startTime: item[1].unwrap().startTime.toNumber(),
        target: convertToFixed18(item[1].unwrap().target || 0)
      };
    });
    const sorted = sortBy(newResult, 'id');

    setResult(sorted);
  }, [collateralAuction]);

  return result;
};

export interface DebitAuction {
  id: string;
  amount: Fixed18;
  fix: Fixed18;
  startTime: number;
}

export const useDebitAuctions = (): DebitAuction[] => {
  const debitAuction = useCall<[StorageKey, Option<DebitAuctionItem>][]>('query.auctionManager.debitAuctions.entries');
  const [result, setResult] = useState<DebitAuction[]>([]);

  useEffect(() => {
    if (!debitAuction) return;

    setResult(debitAuction.map((item) => {
      return {
        amount: convertToFixed18(item[1].unwrap().amount || 0),
        fix: convertToFixed18(item[1].unwrap().fix || 0),
        id: (item[0].toHuman() as string[])[0],
        startTime: item[1].unwrap().startTime.toNumber()
      };
    }));
  }, [debitAuction]);

  return result;
};

export interface SurplusAuction {
  id: string;
  amount: Fixed18;
  startTime: number;
}

export const useSurplusAuction = (): SurplusAuction[] => {
  const surplusAuction = useCall<[StorageKey, Option<SurplusAuctionItem>][]>('query.auctionManager.surplusAuctions.entries');
  const [result, setResult] = useState<SurplusAuction[]>([]);

  useEffect(() => {
    if (!surplusAuction) return;

    setResult(surplusAuction.map((item) => {
      return {
        amount: convertToFixed18(item[1].unwrap().amount || 0),
        id: (item[0].toHuman() as string[])[0],
        startTime: item[1].unwrap().startTime.toNumber()
      };
    }));
  }, [surplusAuction]);

  return result;
};
