import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Typography,
} from '@webb-tools/webb-ui-components';

import {
  InputOrOutputNotes,
  SourceOrDestinationWalletInfo,
  TxBasicInfo,
} from '../../../../containers/TxDetail';
import { ACCOUNT_TRANSACTIONS_FULL_PATH } from '../../../../constants';

import { randEthereumAddress } from '@ngneat/falso';

const notes = [
  {
    serialization:
      'webb://v1:vanchor/1099511632778:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00ee6e14122b4c94ce454a2fd4e7c4af69288014bf2321accb866aeb4e18ca07/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
    amount: '-0.50',
  },
  {
    serialization:
      'webb://v1:vanchor/1099511632778:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00ee6e14122b4c94ce454a2fd4e7c4af69288014bf2321accb866aeb4e18ca07/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
    amount: '-0.50',
  },
  {
    serialization:
      'webb://v1:vanchor/1099511632778:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00ee6e14122b4c94ce454a2fd4e7c4af69288014bf2321accb866aeb4e18ca07/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
    amount: '-0.50',
  },
];

const TransactionDetail: FC = () => {
  const navigate = useNavigate();
  // const { txHash = '' } = useParams<{ txHash: string }>();

  return (
    <Drawer
      defaultOpen
      onOpenChange={(isOpen) =>
        !isOpen && navigate(ACCOUNT_TRANSACTIONS_FULL_PATH)
      }
    >
      <DrawerContent className="!w-[500px] flex flex-col justify-between dark:bg-mono-190">
        {/* Header */}
        <div className="px-9 pt-9 pb-4 flex items-center justify-between">
          <Typography variant="h5" fw="semibold">
            {/* TODO: Update to match with tx activity (Ex: Deposit Details) */}
            Transaction Details
          </Typography>
          <DrawerCloseButton />
        </div>

        {/* Body */}
        <div className="flex-1 p-9 space-y-9 overflow-y-auto">
          {/* Basic Info */}
          <TxBasicInfo
            amount="-1.00"
            tokenSymbol="webbETH"
            txHash={randEthereumAddress()}
            timestamp={1699349367}
            relayerInfo={{
              name: 'webb_relayer.eth',
              amount: '0.01',
              tokenSymbol: 'webbETH',
            }}
          />

          {/* Input Notes */}
          <div className="space-y-3">
            <Typography variant="body1" fw="bold">
              Inputs ({notes.length})
            </Typography>
            {notes.length > 0 && (
              <InputOrOutputNotes
                activity="withdraw"
                type="input"
                typedChainId={1099511707777}
                tokenSymbol="webbETH"
                accAddress={randEthereumAddress()}
                notes={notes}
              />
            )}
          </div>

          {/* Output Notes */}
          <div className="space-y-3">
            <Typography variant="body1" fw="bold">
              Outputs ({0})
            </Typography>
            {/* {notes.length > 0 && (
              <InputOrOutputNotes
                activity="withdraw"
                type="output"
                typedChainId={1099511707777}
                tokenSymbol="webbETH"
                accAddress={randEthereumAddress()}
                notes={notes}
              />
            )} */}

            {/* Destination */}
            <SourceOrDestinationWalletInfo
              type="destination"
              typedChainId={1099511707777}
              walletAddress={randEthereumAddress()}
              amount="+1.889"
              tokenSymbol="webbETH"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-9 py-6 flex flex-col gap-2 border-t border-mono-60 dark:border-mono-160">
          {/* TODO: Explorer Link */}
          <Button isFullWidth>View on Explorer</Button>
          <Button
            variant="secondary"
            isFullWidth
            onClick={() => {
              navigate(ACCOUNT_TRANSACTIONS_FULL_PATH);
            }}
          >
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionDetail;
