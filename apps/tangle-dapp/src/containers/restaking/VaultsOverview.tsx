import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import VaultsTable from '../../components/tables/Vaults';
import useVaultTableData from '../../hooks/useVaultTableData';

export default function VaultsOverview() {
  const { isLoading } = useRestakeContext();
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { vaults, tableProps } = useVaultTableData({
    delegatorInfo,
  });

  return (
    <VaultsTable data={vaults} tableProps={tableProps} isLoading={isLoading} />
  );
}
