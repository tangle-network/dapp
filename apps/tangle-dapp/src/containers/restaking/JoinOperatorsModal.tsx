import {
  AmountFormatStyle,
  Caption,
  formatDisplayAmount,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import useJoinOperatorsTx from '../../data/restake/useJoinOperatorsTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import AmountInput from '../../components/AmountInput';
import { BN } from '@polkadot/util';
import useApi from '../../hooks/useApi';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { OPERATOR_JOIN_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import useBalances from '../../data/balances/useBalances';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const JoinOperatorsModal: FC<Props> = ({ isOpen, setIsOpen }) => {
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
    useCallback(
      (api) => api.consts.multiAssetDelegation.minOperatorBondAmount.toBn(),
      [],
    ),
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

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="sm">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Join Operators
        </ModalHeader>

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
          />

          <Caption linkHref={OPERATOR_JOIN_DOCS_LINK}>{captionText}</Caption>
        </ModalBody>

        <ModalFooterActions
          onClose={() => setIsOpen(false)}
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleConfirmClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default JoinOperatorsModal;
