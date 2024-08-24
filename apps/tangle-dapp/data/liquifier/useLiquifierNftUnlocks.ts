import { BN } from '@polkadot/util';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';

import { BaseUnstakeRequest } from '../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import LIQUIFIER_UNLOCKS_ABI from '../../constants/liquidStaking/liquifierUnlocksAbi';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import isLsErc20TokenId from '../../utils/liquidStaking/isLsErc20TokenId';
import { useLiquidStakingStore } from '../liquidStaking/useLiquidStakingStore';
import { ContractReadOptions } from './useContractRead';
import useContractReadSubscription from './useContractReadSubscription';

/**
 * Represents the metadata of an ERC-721 NFT liquifier unlock request.
 *
 * See: https://github.com/webb-tools/tnt-core/blob/21c158d6cb11e2b5f50409d377431e7cd51ff72f/src/lst/unlocks/Unlocks.sol#L21
 */
export type LiquifierUnlockNftMetadata = BaseUnstakeRequest & {
  type: 'liquifierUnlockNft';
  symbol: string;
  name: string;
  validator: Address;

  /**
   * How far the unlock request has progressed, in percentage (e.g.
   * `0.5` for 50%).
   */
  progress: number;

  /**
   * A timestamp representing the date at which the unlock request
   * can be fulfilled.
   */
  maturityTimestamp: number;
};

/**
 * In the case of liquifier unlock requests, they are represented
 * by ERC-721 NFTs owned by the user.
 *
 * Each unlock NFT has associated metadata about the unlock request,
 * including the progress of the unlock request, the amount of underlying
 * stake tokens, and the maturity timestamp.
 */
const useLiquifierNftUnlocks = (): LiquifierUnlockNftMetadata[] | null => {
  const { selectedProtocolId } = useLiquidStakingStore();
  const activeEvmAddress20 = useEvmAddress20();

  const getUnlockIdCountOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_UNLOCKS_ABI,
    'balanceOf'
  > | null => {
    if (activeEvmAddress20 === null || !isLsErc20TokenId(selectedProtocolId)) {
      return null;
    }

    const protocol = getLsProtocolDef(selectedProtocolId);

    return {
      // TODO: This should be something like 'unlockAddress', defined per-protocol. For now, just use the protocol address as a placeholder.
      address: protocol.address,
      functionName: 'balanceOf',
      args: [activeEvmAddress20],
    };
  }, [activeEvmAddress20, selectedProtocolId]);

  const { value: rawUnlockIdCount } = useContractReadSubscription(
    LIQUIFIER_UNLOCKS_ABI,
    getUnlockIdCountOptions,
  );

  const unlockIds = useMemo(() => {
    if (rawUnlockIdCount === null) {
      return null;
    }

    const ids = [];

    // TODO: Since this is a `balanceOf` operation, might need to shrink it down to base unit, since it's likely in the underlying token's decimals, which is very big, causing JavaScript to throw an `invalid array length` error. Also, for now made the upper bound be `0`, it should be `rawUnlockIdCount`, but it was erroring since it's not yet implemented.
    for (let i = 0; i < 0; i++) {
      ids.push(i);
    }

    return ids;
  }, [rawUnlockIdCount]);

  // TODO: Need to page/lazy load this, since there could be many unlock requests. Then, paging would be handled by the parent table component. Perhaps try to add the lazy loading functionality directly into the `useContractReadSubscription` hook (e.g. multi-arg fetch capability + paging options & state).
  const getMetadataOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_UNLOCKS_ABI,
    'getMetadata'
  > | null => {
    // Do not fetch if there's no active EVM account.
    if (activeEvmAddress20 === null || !isLsErc20TokenId(selectedProtocolId)) {
      return null;
    }

    const protocol = getLsProtocolDef(selectedProtocolId);

    return {
      // TODO: This should be something like 'unlockAddress', defined per-protocol. For now, just use the protocol address as a placeholder.
      address: protocol.address,
      functionName: 'getMetadata',
      // TODO: Using index 0 for now, until paging is implemented.
      // TODO: Consider adding support for an array of args, which would be interpreted as a multi-fetch by `useContractReadSubscription`.
      args: [BigInt(0)],
    };
  }, [activeEvmAddress20, selectedProtocolId]);

  const { value: rawMetadata } = useContractReadSubscription(
    LIQUIFIER_UNLOCKS_ABI,
    getMetadataOptions,
  );

  const metadata = useMemo<LiquifierUnlockNftMetadata[] | null>(() => {
    if (rawMetadata === null) {
      return null;
    }

    return [
      {
        type: 'liquifierUnlockNft',
        // TODO: Using dummy decimals for now. Obtain them from the protocol definition?
        decimals: 18,
        unlockId: Number(rawMetadata.unlockId),
        symbol: rawMetadata.symbol,
        name: rawMetadata.name,
        validator: rawMetadata.validator,
        progress: Number(rawMetadata.progress) / 100,
        amount: new BN(rawMetadata.amount.toString()),
        maturityTimestamp: Number(rawMetadata.maturity),
      } satisfies LiquifierUnlockNftMetadata,
    ];
  }, [rawMetadata]);

  return metadata;
};

export default useLiquifierNftUnlocks;
