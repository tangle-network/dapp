import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  AmountFormatStyle,
  Caption,
  formatDisplayAmount,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { OPERATOR_JOIN_DOCS_LINK } from '@tangle-network/ui-components/constants/tangleDocs';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import AmountInput from '../../components/AmountInput';
import useBalances from '../../data/balances/useBalances';
import useJoinOperatorsTx from '../../data/restake/useJoinOperatorsTx';
import useApi from '../../hooks/useApi';
import { TxStatus } from '../../hooks/useSubstrateTx';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

const JoinOperatorsModal: FC<Props> = ({ setIsOpen }) => {
  const [bondAmount, setBondAmount] = useState<BN | null>(null);
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute, status } = useJoinOperatorsTx();
  const { free } = useBalances();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReady =
    status !== TxStatus.PROCESSING &&
    bondAmount !== null &&
    execute !== null &&
    errorMessage === null;

  const handleConfirmClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    return execute({ bondAmount });
  }, [bondAmount, execute, isReady]);

  const { result: minOperatorBond } = useApi(
    useCallback((api) => {
      if (
        api.consts.multiAssetDelegation?.minOperatorBondAmount === undefined
      ) {
        return null;
      }

      return api.consts.multiAssetDelegation.minOperatorBondAmount.toBn();
    }, []),
  );

  const captionText = useMemo<string>(() => {
    if (minOperatorBond === null) {
      return 'A minimum bond amount may be required to register as an operator. This stake recovered after an unbonding period.';
    }

    const fmtMinOperatorBond = formatDisplayAmount(
      minOperatorBond,
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.EXACT,
    );

    return `A minimum bond amount of ${fmtMinOperatorBond} ${nativeTokenSymbol} is required to register as an operator. This stake recovered after an unbonding period.`;
  }, [minOperatorBond, nativeTokenSymbol]);

  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setBondAmount(null);
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  return (
    <ModalContent size="sm">
      <ModalHeader>Join Operators</ModalHeader>

      <ModalBody className="gap-3">
        <AmountInput
          id="restake-join-operators-bond"
          title="Bond Amount"
          amount={bondAmount}
          min={minOperatorBond}
          max={free}
          showMaxAction
          setAmount={setBondAmount}
          placeholder="Enter the amount to bond"
          setErrorMessage={setErrorMessage}
          wrapperOverrides={{ isFullWidth: true }}
        />

        <Caption linkHref={OPERATOR_JOIN_DOCS_LINK}>{captionText}</Caption>
      </ModalBody>

      <ModalFooterActions
        hasCloseButton
        isProcessing={status === TxStatus.PROCESSING}
        onConfirm={handleConfirmClick}
        isConfirmDisabled={!isReady}
      />
    </ModalContent>
  );
};

export default JoinOperatorsModal;
