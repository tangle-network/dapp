import { Button, Icon, Typography } from '@mui/material';
import { InteractiveFeedback, Wallet, WebbError, WebbErrorCodes } from '@webb-dapp/api-providers';
import { WalletId, walletsConfig } from '@webb-dapp/apps/configs';
import ChromeLogo from '@webb-dapp/apps/configs/logos/ChromeLogo';
import FireFoxLogo from '@webb-dapp/apps/configs/logos/FireFoxLogo';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { getPlatformMetaData, SupportedBrowsers } from '@webb-dapp/utils/platform';

export function getWalletByWebbErrorCodes(code: WebbErrorCodes): Wallet {
  switch (code) {
    case WebbErrorCodes.PolkaDotExtensionNotInstalled:
      return walletsConfig[WalletId.Polkadot];

    case WebbErrorCodes.MetaMaskExtensionNotInstalled:
      return walletsConfig[WalletId.MetaMask];

    case WebbErrorCodes.TalismanExtensionNotInstalled:
      return walletsConfig[WalletId.Talisman];

    default:
      throw WebbError.from(WebbErrorCodes.UnknownWallet);
  }
}

export function extensionNotInstalled(extension: Wallet): InteractiveFeedback {
  const platformMetaData = getPlatformMetaData();
  let Logo: () => JSX.Element;
  switch (platformMetaData.id) {
    case SupportedBrowsers.Chrome:
      Logo = ChromeLogo;
      break;
    case SupportedBrowsers.FireFox:
      Logo = FireFoxLogo;
      break;
  }

  let interactiveFeedback: InteractiveFeedback;
  const extensionName = extension.title;

  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `${extensionName} extension isn't installed`,
    },
    {
      content: 'Please consider installing the browser extension for your browser',
    },
    {
      any: () => {
        return (
          <Padding v={2} x={0}>
            <div>
              <Button
                color='primary'
                variant={'text'}
                fullWidth
                onClick={() => {
                  window.open(extension.homeLink, '_blank');
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                  }}
                >
                  <extension.Logo />
                </div>
                <Padding v x={0.5} />
                <Typography>{extensionName} official website</Typography>
                <Padding v x={0.5} />
                <Icon>open_in_new</Icon>
              </Button>
            </div>
            <Padding v />
            <div>
              <Button
                color='primary'
                variant='contained'
                fullWidth
                onClick={() => {
                  const url = extension.installLinks ? extension.installLinks[platformMetaData.id] : '';
                  window.open(url, '_blank');
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                  }}
                >
                  <Logo />
                </div>
                <Padding x={0.5} />
                <Typography>Get it from {platformMetaData.storeName} </Typography>
                <Padding v={2} x={0.5} />
                <Icon>get_app</Icon>
              </Button>
            </div>
          </Padding>
        );
      },
    },
  ]);

  const actions = InteractiveFeedback.actionsBuilder()
    .action(
      'Ok',
      () => {
        interactiveFeedback?.cancelWithoutHandler();
      },
      'success'
    )
    .actions();
  interactiveFeedback = new InteractiveFeedback(
    'error',
    actions,
    () => {
      interactiveFeedback?.cancel();
    },
    feedbackBody,
    WebbErrorCodes.UnsupportedChain
  );
  return interactiveFeedback;
}
