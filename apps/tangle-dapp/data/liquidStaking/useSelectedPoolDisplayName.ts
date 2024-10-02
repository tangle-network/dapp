import { LsPoolDisplayName } from '../../constants/liquidStaking/types';
import useLsPoolsMetadata from './useLsPoolsMetadata';
import { useLsStore } from './useLsStore';

const useSelectedPoolDisplayName = (): LsPoolDisplayName | null => {
  const { selectedPoolId } = useLsStore();
  const lsPoolsMetadata = useLsPoolsMetadata();

  if (selectedPoolId === null) {
    return null;
  }

  const name = lsPoolsMetadata?.get(selectedPoolId) ?? '';

  return `${name}#${selectedPoolId}`;
};

export default useSelectedPoolDisplayName;
