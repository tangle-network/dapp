import { assert, BN } from '@polkadot/util';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';

import { BaseUnstakeRequest } from '../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import { IS_PRODUCTION_ENV } from '../../constants/env';
import LIQUIFIER_UNLOCKS_ABI from '../../constants/liquidStaking/liquifierUnlocksAbi';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import { useLiquidStakingStore } from '../liquidStaking/useLiquidStakingStore';
import useContractRead from './useContractRead';
import useContractReadBatch, {
  ContractReadOptionsBatch,
} from './useContractReadBatch';
import { ContractReadOptions } from './useContractReadOnce';

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

  const protocol = getLsProtocolDef(selectedProtocolId);

  const getUnlockIdCountOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_UNLOCKS_ABI,
    'balanceOf'
  > | null => {
    if (activeEvmAddress20 === null || protocol.type !== 'liquifier') {
      return null;
    }

    return {
      address: protocol.unlocksContractAddress,
      functionName: 'balanceOf',
      args: [activeEvmAddress20],
    };
  }, [activeEvmAddress20, protocol]);

  const { value: rawUnlockIdCount } = useContractRead(
    LIQUIFIER_UNLOCKS_ABI,
    getUnlockIdCountOptions,
  );

  const unlockIds = useMemo(() => {
    if (rawUnlockIdCount === null || rawUnlockIdCount instanceof Error) {
      return null;
    }

    // Extremely unlikely that the user would have this many unlock
    // requests, but just in case.
    assert(
      rawUnlockIdCount <= Number.MAX_SAFE_INTEGER,
      'Unlock ID count exceeds maximum safe integer, user seems to have an unreasonable amount of unlock requests',
    );

    const unlockIdCount = Number(rawUnlockIdCount);

    return Array.from<bigint>({
      length: unlockIdCount,
    }).map((_, i) => BigInt(i));
  }, [rawUnlockIdCount]);

  const getMetadataOptions = useCallback((): ContractReadOptionsBatch<
    typeof LIQUIFIER_UNLOCKS_ABI,
    'getMetadata'
  > | null => {
    if (
      // Do not fetch if there's no active EVM account.
      activeEvmAddress20 === null ||
      protocol.type !== 'liquifier' ||
      unlockIds === null
    ) {
      return null;
    }

    const batchArgs = unlockIds.map((unlockId) => [BigInt(unlockId)] as const);

    return {
      address: protocol.unlocksContractAddress,
      functionName: 'getMetadata',
      args: batchArgs,
    };
  }, [activeEvmAddress20, protocol, unlockIds]);

  const { results: rawMetadatas } = useContractReadBatch(
    LIQUIFIER_UNLOCKS_ABI,
    getMetadataOptions,
  );

  const metadatas = useMemo<LiquifierUnlockNftMetadata[] | null>(() => {
    if (rawMetadatas === null) {
      return null;
    }

    return rawMetadatas.flatMap((metadata, index) => {
      // Ignore failed metadata fetches and those that are still loading.
      if (metadata === null || metadata instanceof Error) {
        return [];
      }

      // The Sepolia development contract always returns 0 for the
      // unlock ID. Use the index number to differentiate between
      // different unlock requests.
      const unlockId = IS_PRODUCTION_ENV ? Number(metadata.unlockId) : index;

      // On development, mark some as completed for testing purposes.
      const progress = IS_PRODUCTION_ENV
        ? Number(metadata.progress) / 100
        : index < 10
          ? 1
          : 0.6123;

      return {
        type: 'liquifierUnlockNft',
        decimals: protocol.decimals,
        unlockId,
        symbol: metadata.symbol,
        name: metadata.name,
        validator: metadata.validator,
        progress,
        amount: new BN(metadata.amount.toString()),
        maturityTimestamp: Number(metadata.maturity),
      } satisfies LiquifierUnlockNftMetadata;
    });
  }, [protocol.decimals, rawMetadatas]);

  return metadatas;
};

export default useLiquifierNftUnlocks;
