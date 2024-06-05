import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  Download,
  ExchangeLine,
  InformationLine,
  WalletLineIcon,
} from '@webb-tools/icons';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import {
  Button,
  CheckBox,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Lottie from 'lottie-react';
import { FC, useCallback, useState } from 'react';
import { NOTE_ACCOUNT_DOCS_URL } from '../../constants/links';
import { createSignInMessage } from '../../constants/signIn';
import congratsJson from './congrats.json';
import privacySecurityJson from './privacy-security.json';
import { CreateAccountModalProps } from './types';

const successBridgeInfo = [
  {
    title: 'Deposit',
    description:
      "Making a deposit will utilize your note account's public key to create a unique UTXO record that can only be spent by you.",
    icon: <WalletLineIcon />,
  },
  {
    title: 'Storage',
    description:
      'Your notes are stored locally as you transact through this application and encrypted on-chain for persistent storage.',
    icon: <Download />,
  },
  {
    title: 'Withdraw/Transfer',
    description:
      "Using your note account's private key, you can generate the zero-knowledge proofs necessary for spending your stored UTXOs.",
    icon: <ExchangeLine />,
  },
  {
    title: 'Privacy',
    description:
      'To maximize your privacy and protect yourself while transacting, read through our recommended user behaviors.',
    icon: <InformationLine />,
  },
];

export const CreateAccountModal: FC<CreateAccountModalProps> = ({
  isOpen,
  onOpenChange,
  isSuccess,
  onIsSuccessChange: setIsSuccess,
}) => {
  // The checkbox state
  const [isChecked, setIsChecked] = useState(false);

  // Loading button when user hits create account
  const [isCreating, setIsCreating] = useState(false);

  const { loginNoteAccount, activeApi } = useWebContext();

  const loginWithMetamask = useCallback(async () => {
    try {
      setIsCreating(true);

      if (!activeApi) {
        throw WebbError.from(WebbErrorCodes.ApiNotReady);
      }

      if (!(activeApi instanceof WebbWeb3Provider)) {
        throw WebbError.from(WebbErrorCodes.NotImplemented);
      }

      const account = activeApi.accounts.activeOrDefault;
      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }

      const msg = createSignInMessage(account.address);

      const signedString = await activeApi.sign(msg);

      await loginNoteAccount(signedString.slice(0, 66), account.address);

      setIsSuccess?.(true);
    } catch (error) {
      console.log('Error occurs when creating note account');
      console.log(error);
    } finally {
      setIsCreating(false);
    }
  }, [activeApi, loginNoteAccount, setIsSuccess]);

  const handleOpenChange = useCallback(
    async (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleCloseAutoFocus = useCallback(() => {
    setIsChecked(false);
    setIsSuccess?.(false);
  }, [setIsSuccess]);

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="overflow-hidden bg-mono-0 dark:bg-mono-160 rounded-xl w-[420px]"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <ModalHeader onClose={() => handleOpenChange(false)}>
          {isSuccess ? 'Congrats!' : 'Create Note Account'}
        </ModalHeader>

        {/** Modal Body */}
        <div className="relative py-4 px-9 space-y-9">
          <Typography variant="body1" fw="bold">
            {isSuccess
              ? 'You can now start transacting privately!'
              : 'The note account requires a wallet signature to help you manage cross-chain assets privately and with ease.'}
          </Typography>

          <Lottie
            animationData={privacySecurityJson}
            className="rounded-full mx-auto w-[80px] h-[80px] overflow-hidden"
          />

          {isSuccess ? (
            <SuccessModalBody />
          ) : (
            <>
              <Typography variant="body2">
                Your note account will be used to derive secrets that will be
                used to transact on the bridge. You should never share these
                secrets or your note account with anyone, including sharing the
                signature that was used to generate your account.
              </Typography>
              <div>
                <CheckBox
                  isChecked={isChecked}
                  onChange={() => setIsChecked((prev) => !prev)}
                  spacingClassName="ml-2"
                  labelVariant="body2"
                >
                  By selecting “Create Note Account”, you agree to Webb's Terms
                  of Use and Privacy Policy.
                </CheckBox>
              </div>
            </>
          )}

          {/** Confetti animation */}
          {isSuccess && (
            <Lottie
              className={cx('absolute inset-0 !mt-0')}
              animationData={congratsJson}
            />
          )}
        </div>

        <ModalFooter>
          <Button
            isLoading={isCreating}
            loadingText="Waiting for user to sign..."
            onClick={() =>
              isSuccess ? handleOpenChange(false) : loginWithMetamask()
            }
            isDisabled={isSuccess ? undefined : !isChecked}
            isFullWidth
          >
            {isSuccess ? 'Get Started' : 'Create Note Account'}
          </Button>
          <Button
            variant="secondary"
            isFullWidth
            href={NOTE_ACCOUNT_DOCS_URL}
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
