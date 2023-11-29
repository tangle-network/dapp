import { type FC, useMemo } from 'react';
import cx from 'classnames';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

import ChainsRing from '../../components/ChainsRing';
import ContractListCard from '../../components/ListCard/ContractListCard';
import { Typography } from '../../typography';
import type { GovernanceListingCardProps } from './types';
import type { ChainRingItemType } from '../../components/ChainsRing/types';

const GovernanceContractListingCard: FC<GovernanceListingCardProps> = ({
  typedChainIdSelections,
  selectedTypedChainId,
  handleSelectChain,
  isLoadingList,
  selectContractItems,
}) => {
  const chainRingItems = useMemo<ChainRingItemType[]>(() => {
    return typedChainIdSelections.map((typedChainId) => {
      return {
        typedChainId,
        isActive: selectedTypedChainId === typedChainId,
        onClick: handleSelectChain
          ? () => handleSelectChain(typedChainId)
          : undefined,
      };
    });
  }, []);

  return (
    <div
      className={cx(
        'max-w-[600px] bg-mono-0 dark:bg-mono-190 rounded-xl p-9',
        'flex flex-col items-center gap-6',
        'border border-mono-40 dark:border-mono-160'
      )}
    >
      {/* Chains Ring */}
      <ChainsRing
        chainItems={chainRingItems}
        circleContent={
          <div>
            <Typography
              variant="body1"
              fw="bold"
              ta="center"
              className="text-mono-140 dark:text-mono-80 capitalize"
            >
              {selectedTypedChainId !== undefined
                ? chainsConfig[selectedTypedChainId].name
                : 'Select Chain'}
            </Typography>
          </div>
        }
      />

      {/* Contract List */}
      <ContractListCard
        selectContractItems={selectContractItems}
        isLoading={isLoadingList}
      />
    </div>
  );
};

export default GovernanceContractListingCard;
