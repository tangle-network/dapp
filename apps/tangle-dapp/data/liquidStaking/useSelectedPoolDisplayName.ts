import { LsPoolDisplayName } from '../../constants/liquidStaking/types';
import useLsPoolsMetadata from './useLsPoolsMetadata';
import { useLsStore } from './useLsStore';

const useSelectedPoolDisplayName = (): LsPoolDisplayName | null => {
  const { selectedPoolId } = useLsStore();
  const lsPoolsMetadata = useLsPoolsMetadata();
  const name = lsPoolsMetadata?.get(selectedPoolId) ?? '';

  return selectedPoolId === null ? null : `${name}#${selectedPoolId}`;
};

export default useSelectedPoolDisplayName;
