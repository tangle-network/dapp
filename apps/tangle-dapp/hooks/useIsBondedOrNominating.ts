import useIsBonded from './useIsBonded';
import useIsNominating from './useIsNominating';

const useIsBondedOrNominating = () => {
  const isNominating = useIsNominating();
  const isBonded = useIsBonded();

  return isBonded === null && isNominating === null
    ? null
    : isBonded.isBonded === true || isNominating.isNominating === true;
};

export default useIsBondedOrNominating;
