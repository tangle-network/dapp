import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import VaultsTable from '../../components/tables/Vaults';
import useVaultTableData from '../../hooks/useVaultTableData';

const VaultsOverview = () => {
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { vaults, tableProps, isLoading } = useVaultTableData({
    delegatorInfo,
  });

  return (
    <VaultsTable data={vaults} tableProps={tableProps} isLoading={isLoading} />
  );
};

export default VaultsOverview;
