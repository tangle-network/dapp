import { Currency } from '@webb-tools/abstract-api-provider';
import { Chain } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  AMOUNT_KEY,
  BRIDGE_PATH,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TRANSFER_PATH,
  WITHDRAW_PATH,
} from '../../constants';

function useNoteAction() {
  const navigate = useNavigate();

  const handleNoteAction = useCallback(
    async (
      action: 'transfer' | 'withdraw',
      chain: Chain,
      fungibleCurrency?: Currency,
      amount?: bigint,
    ) => {
      const actionPaths: {
        [key in typeof action]: string;
      } = {
        transfer: TRANSFER_PATH,
        withdraw: WITHDRAW_PATH,
      };

      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);

      const searchParams = new URLSearchParams({
        [SOURCE_CHAIN_KEY]: typedChainId.toString(),
      });

      if (fungibleCurrency) {
        searchParams.set(POOL_KEY, fungibleCurrency.id.toString());
      }

      if (typeof amount === 'bigint') {
        searchParams.set(AMOUNT_KEY, amount.toString());
      }

      navigate({
        pathname: `/${BRIDGE_PATH}/${actionPaths[action]}`,
        search: searchParams.toString(),
      });
    },
    [navigate],
  );

  return handleNoteAction;
}

export default useNoteAction;
