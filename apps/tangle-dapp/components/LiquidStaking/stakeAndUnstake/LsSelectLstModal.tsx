import { Search, TokenIcon } from '@webb-tools/icons';
import {
  Input,
  ListItem,
  Modal,
  ModalContent,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, useMemo, useState } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import {
  LsPool,
  LsPoolDisplayName,
} from '../../../constants/liquidStaking/types';
import { ListCardWrapper } from '../../Lists/ListCardWrapper';
import SkeletonRows from '../SkeletonRows';
import { twMerge } from 'tailwind-merge';

export type LsSelectLstModalProps = {
  pools: LsPool[] | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: (lsPoolId: number) => void;
};

const LsSelectLstModal: FC<LsSelectLstModalProps> = ({
  pools,
  isOpen,
  onSelect,
  setIsOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPools = useMemo(() => {
    if (pools === null) {
      return null;
    }

    return pools.filter((pool) => {
      const displayName: LsPoolDisplayName = `${pool.name}#${pool.id}`;

      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [pools, searchQuery]);

  // Sort pools by highest TVL in descending order.
  const sortedPools = useMemo(() => {
    if (filteredPools === null) {
      return null;
    }

    return filteredPools.toSorted((a, b) => {
      return b.totalStaked.sub(a.totalStaked).isNeg() ? -1 : 1;
    });
  }, [filteredPools]);

  return (
    <Modal>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className={twMerge(
          'w-[500px] max-h-[600px]',
          sortedPools !== null && 'h-full',
        )}
      >
        <ListCardWrapper title="Select LST" onClose={() => setIsOpen(false)}>
          <div className="px-4 md:px-9 pb-4 border-b border-mono-40 dark:border-mono-170">
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

          <ScrollArea className="w-full h-full">
            <ul>
              {sortedPools === null ? (
                <div className="p-8">
                  <SkeletonRows rowCount={7} className="h-[40px]" />
                </div>
              ) : (
                sortedPools.map((pool, idx) => (
                  <ListItem
                    key={`${pool.id}-${idx}`}
                    onClick={() => {
                      onSelect(pool.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {/** TODO: Set token based on protocol. */}
                      <TokenIcon
                        size="md"
                        name="TNT"
                        className="mr-2 w-[38px] h-[38px]"
                      />

                      <div className="flex flex-col gap-1">
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
                      </div>
                    </div>

                    <Typography variant="body1">
                      {pool.apyPercentage ?? EMPTY_VALUE_PLACEHOLDER}% APY
                    </Typography>
                  </ListItem>
                ))
              )}
            </ul>
          </ScrollArea>
        </ListCardWrapper>
      </ModalContent>
    </Modal>
  );
};

export default LsSelectLstModal;
