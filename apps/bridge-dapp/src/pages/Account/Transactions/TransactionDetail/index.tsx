import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Typography,
} from '@webb-tools/webb-ui-components';

import TxDetailContainer from '../../../../containers/TxDetailContainer';
import { ACCOUNT_TRANSACTIONS_FULL_PATH } from '../../../../constants';

import { randEthereumAddress } from '@ngneat/falso';

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

        {/* Content */}

        {/* DEPOSIT */}
        {/* <TxDetailContainer
          hash={randEthereumAddress()}
          activity="deposit"
          amount={0.87}
          noteAccountAddress={randEthereumAddress()}
          walletAddress={randEthereumAddress()}
          fungibleTokenSymbol="webbETH"
          wrappableTokenSymbol="ETH"
          timestamp={1699673249}
          outputNoteSerializations={[
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
          ]}
        /> */}

        {/* TRANSFER */}
        {/* <TxDetailContainer
          hash={randEthereumAddress()}
          activity="transfer"
          amount={0.87}
          noteAccountAddress={randEthereumAddress()}
          walletAddress={randEthereumAddress()}
          fungibleTokenSymbol="webbETH"
          wrappableTokenSymbol="ETH"
          relayerName="webb_relayer.eth"
          relayerFeeAmount={0.1}
          timestamp={1699673249}
          inputNoteSerializations={[
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00893216e71881188829797e313bb49ff6ebbe14d414a1ddee16e3672331e470/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
            'webb://v1:vanchor/1099511632777:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:0066f9063d6b942655e8f30e45a2039581cbcecfff3f5c6619bf6a1699125b2a/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
          ]}
          outputNoteSerializations={[
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
          ]}
        /> */}

        {/* WITHDRAW */}
        <TxDetailContainer
          hash={randEthereumAddress()}
          activity="withdraw"
          amount={0.87}
          noteAccountAddress={randEthereumAddress()}
          walletAddress={randEthereumAddress()}
          fungibleTokenSymbol="webbETH"
          relayerName="webb_relayer.eth"
          relayerFeeAmount={0.1}
          timestamp={1699673249}
          inputNoteSerializations={[
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00893216e71881188829797e313bb49ff6ebbe14d414a1ddee16e3672331e470/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
            'webb://v1:vanchor/1099511632777:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:0066f9063d6b942655e8f30e45a2039581cbcecfff3f5c6619bf6a1699125b2a/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
          ]}
          outputNoteSerializations={[
            'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
          ]}
        />

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
