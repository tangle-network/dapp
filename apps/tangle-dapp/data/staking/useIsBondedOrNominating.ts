import useIsNominating from '../../hooks/useIsNominating';
import useIsBonded from './useIsBonded';

const useIsBondedOrNominating = () => {
  const isNominating = useIsNominating();
  const isBonded = useIsBonded();

  return isBonded === null && isNominating === null
    ? null
    : isBonded.isBonded === true || isNominating.isNominating === true;
};

export default useIsBondedOrNominating;
