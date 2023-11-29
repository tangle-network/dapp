import type { ContractType } from '../../components/ListCard/types';

export interface GovernanceListingCardProps {
  typedChainIdSelections: number[];
  selectedTypedChainId: number;
  isLoadingList?: boolean;
  selectContractItems: ContractType[];
  handleSelectChain?: (typedChainId: number) => void;
}
