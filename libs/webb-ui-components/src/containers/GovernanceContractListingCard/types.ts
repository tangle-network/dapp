import type { ContractType } from '../../components/ListCard/types';

export interface GovernanceListingCardProps {
  /**
   * All the chain options to be be chosen
   */
  typedChainIdSelections: number[];

  /**
   * Current selected chain
   */
  selectedTypedChainId: number;

  /**
   * Is the list of contracts currently loading
   */
  isLoadingList?: boolean;

  /**
   * All the contracts to be displayed
   */
  selectContractItems: ContractType[];

  /**
   * Function to call when user select a chain
   */
  handleSelectChain?: (typedChainId: number) => void;
}
