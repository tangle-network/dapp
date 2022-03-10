import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { FlexBox } from '@webb-dapp/ui-components/Box';
import { WalletSelect } from '@webb-dapp/ui-components/Inputs/WalletSelect/WalletSelect';
import * as React from 'react';

type RequiredWalletSelectionProps = {};

export const RequiredWalletSelection: React.FC<RequiredWalletSelectionProps> = ({ children }) => {
  const { activeWallet } = useWebContext();

  return (
    <>
      {!activeWallet && (
        <FlexBox>
          <WalletSelect />
        </FlexBox>
      )}
      {activeWallet && <FlexBox>{children}</FlexBox>}
    </>
  );
};
