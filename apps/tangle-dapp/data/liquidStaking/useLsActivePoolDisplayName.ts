import { LsPoolDisplayName } from '../../constants/liquidStaking/types';
import useLsPoolsMetadata from './useLsPoolsMetadata';
import { useLsStore } from './useLsStore';

const useLsActivePoolDisplayName = (): LsPoolDisplayName | null => {
  const { lsPoolId } = useLsStore();
  const lsPoolsMetadata = useLsPoolsMetadata();

  if (lsPoolId === null) {
    return null;
  }

  const name = lsPoolsMetadata?.get(lsPoolId) ?? '';

  return `${name}#${lsPoolId}`;
};

export default useLsActivePoolDisplayName;
