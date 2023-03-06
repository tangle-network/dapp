import { useWebContext } from '@webb-tools/api-provider-environment';
import { getLatestAnchorAddress } from '@webb-tools/dapp-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3VAnchorActions } from '@webb-tools/web3-api-provider';
import { BigNumber } from 'ethers';
import { useEffect, useRef, useState } from 'react';

import { useVAnchor } from './vanchor/useVAnchor';

type UseGasAmountOptionType = Partial<
  Parameters<Web3VAnchorActions['getGasAmount']>[1]
>;

const hasGetGasAmountMethod = (
  vanchorApi: any | undefined
): vanchorApi is Web3VAnchorActions => {
  return !!vanchorApi && typeof vanchorApi['getGasAmount'] === 'function';
};

export function useGasAmount(
  options: UseGasAmountOptionType = {}
): BigNumber | null {
  const optRef = useRef(options);

  const [gasAmount, setGasAmount] = useState<BigNumber | null>(null);

  const { activeChain } = useWebContext();

  const { api: vanchorApi } = useVAnchor();

  useEffect(() => {
    const getGasAmount = async () => {
      if (!vanchorApi || !activeChain) return;

      if (!hasGetGasAmountMethod(vanchorApi)) {
        console.error('getGasAmount is not available');
        return;
      }

      const chainTypedId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      const vanchorAddress = getLatestAnchorAddress(chainTypedId);
      if (!vanchorAddress) {
        console.error('vanchorAddress is not available');
        return;
      }

      try {
        const {
          input = [],
          output = [],
          fee = 0,
          refund = 0,
          recipient = zeroAddress,
          relayer = zeroAddress,
          wrapUnwrapToken = '',
          leavesMap = {},
        } = optRef.current;
        const gas = await vanchorApi.getGasAmount(vanchorAddress, {
          input,
          output,
          fee,
          refund,
          recipient,
          relayer,
          wrapUnwrapToken,
          leavesMap,
        });

        setGasAmount(gas);
      } catch (error) {
        console.error('Error getting gas amount: ', error);
      }
    };

    getGasAmount();
  }, [activeChain, vanchorApi]);

  return gasAmount;
}
