import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import VaultsTable from '../../components/tables/Vaults';
import useVaultTableData from '../../hooks/useVaultTableData';

export default function VaultsOverview() {
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { vaults, tableProps } = useVaultTableData({
    delegatorInfo,
  });

  return <VaultsTable data={vaults} tableProps={tableProps} />;
}
