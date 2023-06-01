import { Typography } from '../../typography';
import { Button } from '../Button';
import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '../BottomDialog';

const BRIDGE_LINK = 'webb.tools/hubble_bridge';

export const ConnectWalletMobileButton = () => {
  return (
    <BottomDialog>
      <BottomDialogTrigger className="block lg:hidden">
        <Button isFullWidth>Connect Wallet</Button>
      </BottomDialogTrigger>
      <BottomDialogPortal
        title="Try Hubble on Desktop"
        actionButtonsProps={[
          {
            children: 'Continue on Desktop',
            isFullWidth: true,
            // TODO: replace with real link
            href: '#',
          },
          {
            children: 'Learn more',
            variant: 'secondary',
            isFullWidth: true,
            // TODO: replace with real link
            href: '#',
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <Typography variant="body1">
            A complete mobile experience for Hubble Bridge is in the works. For
            now, enjoy all features on a desktop device.
          </Typography>
          <Typography variant="body1">
            Visit the link on desktop below to start transacting privately!
          </Typography>
          <Typography
            variant="body1"
            className="text-[#3D7BCE] dark:text-[#81B3F6]"
          >
            {BRIDGE_LINK}
          </Typography>
        </div>
      </BottomDialogPortal>
    </BottomDialog>
  );
};
