import { useWebContext } from '@webb-tools/api-provider-environment';
import LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import { ArrowRightUp } from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  WebbUIErrorBoudary as ErrorBoundary,
  Typography,
} from '@webb-tools/webb-ui-components';
import { HUBBLE_STATS_URL } from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import { type FC, type PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { InteractiveFeedbackView } from '../../components';
import { CreateAccountModal, WalletModalContainer } from '../../containers';
import { useTryAnotherWalletWithView } from '../../hooks';

const logger = LoggerService.get('HubbleContainer');

const HubbleContainer: FC<PropsWithChildren> = () => {
  const { activeFeedback } = useWebContext();

  const {
    isOpenNoteAccountModal,
    isSuccessfullyCreatedNoteAccount,
    setOpenNoteAccountModal,
    setSuccessfullyCreatedNoteAccount,
  } = useNoteAccount();

  // Try again for try another wallet link in the token list
  const { TryAnotherWalletModal } = useTryAnotherWalletWithView();

  return (
    <>
      <ErrorBoundary logger={logger}>
        <div className="min-h-[var(--card-height)] flex flex-col mob:!flex-row justify-center">
          <Outlet />

          <a
            href={HUBBLE_STATS_URL}
            target="_blank"
            rel="noreferrer"
            className={cx(
              'mob:!hidden mt-9 ml-auto py-2 px-4 w-fit rounded-2xl',
              'flex justify-end items-center',
              'bg-[#ECF4FF] dark:bg-[#181F2B]',
            )}
          >
            <Typography variant="utility" className="!text-blue-50">
              Explore Stats
            </Typography>
            <ArrowRightUp size="lg" className="!fill-blue-50" />
          </a>
        </div>
      </ErrorBoundary>

      <TryAnotherWalletModal />

      <WalletModalContainer />

      <CreateAccountModal
        isOpen={isOpenNoteAccountModal}
        onOpenChange={(isOpen) => setOpenNoteAccountModal(isOpen)}
        isSuccess={isSuccessfullyCreatedNoteAccount}
        onIsSuccessChange={(success) =>
          setSuccessfullyCreatedNoteAccount(success)
        }
      />

      <InteractiveFeedbackView activeFeedback={activeFeedback} />
    </>
  );
};

export default HubbleContainer;
