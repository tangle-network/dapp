import { Search } from '@webb-tools/icons';
import {
  Input,
  ListItem,
  Modal,
  ModalContent,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LsPool,
  LsPoolDisplayName,
} from '../../../constants/liquidStaking/types';
import formatBn from '../../../utils/formatBn';
import formatFractional from '../../../utils/formatFractional';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import { ListCardWrapper } from '../../Lists/ListCardWrapper';
import ListStatus from '../../ListStatus';
import SkeletonRows from '../../SkeletonRows';
import LstIcon, { LstIconSize } from '../LstIcon';

export type LsSelectLstModalProps = {
  pools: LsPool[] | Error | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: (lsPoolId: number) => void;
  isSelfStaked?: boolean;
};

const LsSelectLstModal: FC<LsSelectLstModalProps> = ({
  pools,
  isOpen,
  onSelect,
  setIsOpen,
  isSelfStaked = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPools = useMemo(() => {
    if (!Array.isArray(pools)) {
      return pools;
    }

    return pools.filter((pool) => {
      const displayName: LsPoolDisplayName = `${pool.name}#${pool.id}`;

      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [pools, searchQuery]);

  // Sort pools by highest TVL in descending order.
  const sortedPools = useMemo(() => {
    if (!Array.isArray(filteredPools)) {
      return filteredPools;
    }

    return filteredPools.toSorted((a, b) => {
      return b.totalStaked.sub(a.totalStaked).isNeg() ? -1 : 1;
    });
  }, [filteredPools]);

  return (
    <Modal>
      <ModalContent
        isOpen={isOpen}
        onInteractOutside={() => setIsOpen(false)}
        size="md"
        className={twMerge(
          'max-h-[600px]',
          Array.isArray(pools) && pools.length > 0 && 'h-full',
        )}
      >
        <ListCardWrapper
          title="Select LST"
          onClose={() => setIsOpen(false)}
          className="w-full max-w-none"
        >
          <div className="px-4 pb-4 border-b md:px-9 border-mono-40 dark:border-mono-170">
            <Input
              id="ls-select-lst-search"
              isControlled
              rightIcon={<Search />}
              placeholder="Search liquid staking tokens by name or ID..."
              value={searchQuery}
              onChange={setSearchQuery}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          </div>

          <ScrollArea className="w-full h-full pt-4">
            <ul>
              {sortedPools instanceof Error ? (
                <ListStatus title="Error" description={sortedPools.message} />
              ) : Array.isArray(sortedPools) &&
                sortedPools.length === 0 &&
                searchQuery.length > 0 ? (
                <ListStatus
                  title="Nothing Found"
                  description="No LSTs found matching your search query."
                  className="my-16"
                />
              ) : Array.isArray(sortedPools) && sortedPools.length === 0 ? (
                <ListStatus
                  title="No LSTs Available"
                  description="Create your own pool to get started!"
                  className="my-16"
                />
              ) : (
                <ListItems
                  pools={sortedPools}
                  isSelfStaked={isSelfStaked}
                  onSelect={(poolId: number) => {
                    onSelect(poolId);
                    setIsOpen(false);
                  }}
                />
              )}
            </ul>
          </ScrollArea>
        </ListCardWrapper>
      </ModalContent>
    </Modal>
  );
};

type ListItemsProps = {
  pools: LsPool[] | null;
  isSelfStaked: boolean;
  onSelect: (lsPoolId: number) => void;
};

/** @internal */
const ListItems: FC<ListItemsProps> = ({ pools, onSelect, isSelfStaked }) => {
  return pools === null ? (
    <div className="p-8">
      <SkeletonRows rowCount={7} className="h-[40px]" />
    </div>
  ) : (
    pools.map((pool, idx) => {
      const commissionText =
        pool.commissionFractional === undefined
          ? undefined
          : `${formatFractional(pool.commissionFractional)} commission`;

      const lsProtocol = getLsProtocolDef(pool.protocolId);

      const stakeAmountString = formatBn(
        pool.totalStaked,
        lsProtocol.decimals,
        {
          withSi: true,
        },
      );

      const stakeText = `${stakeAmountString} ${lsProtocol.token}`;

      return (
        <ListItem
          key={`${pool.id}-${idx}`}
          onClick={() => onSelect(pool.id)}
          className="w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <LstIcon
              lsProtocolId={pool.protocolId}
              iconUrl={pool.iconUrl}
              size={LstIconSize.LG}
            />

            <div className="flex flex-col">
              <Typography
                variant="body1"
                fw="bold"
                className="block text-mono-200 dark:text-mono-0"
              >
                {pool.name?.toUpperCase()}
                <span className="text-mono-180 dark:text-mono-120">
                  #{pool.id}
                </span>
              </Typography>

              <Typography
                variant="body1"
                className="block text-mono-140 dark:text-mono-120"
              >
                {stakeText} {isSelfStaked && 'self '}staked
              </Typography>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center">
            <Typography variant="body1">
              {pool.apyPercentage ?? EMPTY_VALUE_PLACEHOLDER}% APY
            </Typography>

            {commissionText !== undefined && (
              <Typography
                variant="body1"
                className="block text-mono-140 dark:text-mono-120"
              >
                {commissionText}
              </Typography>
            )}
          </div>
        </ListItem>
      );
    })
  );
};

export default LsSelectLstModal;
