import { useWebContext } from '@webb-tools/api-provider-environment';
import { ExchangeLine, TimeLineIcon, WalletLineIcon } from '@webb-tools/icons';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import {
  Button,
  CheckBox,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';
import privacyImg from '../../assets/privacy.gif';
import { CreateAccountModalProps } from './types';

const loginMessage = 'Logging into Webb';

// TODO: Correct the url here
const bridgeDocsSite = 'https://docs.webb.tools/v1/getting-started/overview/';

// TODO: Correct the url here
const accountDocsSite = 'https://docs.webb.tools/v1/getting-started/overview/';

const successBridgeInfo = [
  {
    title: 'Deposit',
    description:
      'By making a deposit, you will generate a random key (spend note) and deposit funds, along with submitting a hash of the note to the Webb smart contract.',
    icon: <WalletLineIcon />,
  },
  {
    title: 'Wait',
    description:
      'After depositing, you should wait some amount of time before withdrawing to improve privacy.',
    icon: <TimeLineIcon />,
  },
  {
    title: 'Withdraw/Transfer',
    description:
      'By making a withdrawal or transfer, Webb will submit a proof of having the valid key of one of the notes deposited and the contract transfers funds to a specified recipient.',
    icon: <ExchangeLine />,
  },
];

export const CreateAccountModal: FC<CreateAccountModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  // The checkbox state
  const [isChecked, setIsChecked] = useState(false);

  // Loading button when user hits create account
  const [isCreating, setIsCreating] = useState(false);

  // The create account success state
  const [isSuccess, setIsSuccess] = useState(false);

  const { loginNoteAccount } = useWebContext();

  const loginWithMetamask = useCallback(async () => {
    try {
      setIsCreating(true);
      const metamask = await Web3Provider.fromExtension();
      const accounts = await metamask.eth.getAccounts();
      if (accounts.length && accounts[0] != null) {
        const signedString = await metamask.eth.personal.sign(
          loginMessage,
          accounts[0],
          undefined
        );
        await loginNoteAccount(signedString.slice(0, 66));

        setIsSuccess(true);
      }
    } catch (error) {
      console.log('Error occurs when creating note account');
      console.log(error);
    } finally {
      setIsCreating(false);
    }
  }, [loginNoteAccount]);

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="overflow-hidden bg-mono-0 dark:bg-mono-160 rounded-xl w-[420px]"
      >
        <ModalHeader onClose={() => onOpenChange(false)}>
          {isSuccess ? 'Congrats!' : 'Create Note Account'}
        </ModalHeader>

        {/** Modal Body */}
        <div className="py-4 px-9 space-y-9">
          <Typography variant="body1" fw="bold">
            {isSuccess
              ? 'You can now start transacting privately!'
              : 'The note account requires a wallet signature to help you manage cross-chain assets privately and with ease.'}
          </Typography>

          {/* TODO: Update the component here, use the lottie animation instead of gif */}
          <img
            src={privacyImg}
            className="rounded-full mx-auto w-[80px] h-[80px]"
            alt="privacy"
          />

          {isSuccess ? (
            <SuccessModalBody />
          ) : (
            <div>
              <CheckBox
                isChecked={isChecked}
                onChange={() => setIsChecked((prev) => !prev)}
                spacingClassName="ml-2"
                labelVariant="body3"
              >
                By selecting “Create Note Account”, you agree to Webb's Terms of
                Use and Privacy Policy.
              </CheckBox>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button
            isLoading={isCreating}
            loadingText="Waiting for user to sign..."
            onClick={() =>
              isSuccess ? onOpenChange(false) : loginWithMetamask()
            }
            isDisabled={isSuccess ? undefined : !isChecked}
            isFullWidth
          >
            {isSuccess ? 'Get Started' : 'Create Note Account'}
          </Button>
          <Button
            variant="secondary"
            isFullWidth
            href={isSuccess ? bridgeDocsSite : accountDocsSite}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const SuccessModalBody = () => {
  return (
    <div className="space-y-2">
      {successBridgeInfo.map((info, idx) => (
        <div key={`${info.title}-${idx}`} className="flex space-x-3">
          <div>{info.icon}</div>

          <div>
            <Typography variant="body2" fw="bold">
              {info.title}
            </Typography>
            <Typography variant="body2">{info.description}</Typography>
          </div>
        </div>
      ))}
    </div>
  );
};
