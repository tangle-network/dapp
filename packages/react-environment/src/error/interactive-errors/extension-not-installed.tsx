import { getPlatformMetaData, SupportedBrowsers } from '@webb-dapp/utils/platform';
import ChromeLogo from '@webb-dapp/apps/configs/wallets/logos/ChromeLogo';
import FireFoxLogo from '@webb-dapp/apps/configs/wallets/logos/FireFoxLogo';
import { InteractiveFeedback } from '@webb-dapp/react-environment';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Button, Typography } from '@material-ui/core';
import { MetaMaskLogo } from '@webb-dapp/apps/configs/wallets/logos/MetaMaskLogo';
import Icon from '@material-ui/core/Icon';
import { WebbErrorCodes } from '@webb-dapp/react-components/InteractiveFeedbackView/InteractiveErrorView';
import React from 'react';
import { PolkaLogo } from '@webb-dapp/apps/configs/wallets/logos/PolkaLogo';
//TODO : move to wallet config
const metaMaskConfig = {
  homeLink: 'https://https://metamask.io/',
  installLinks: {
    [SupportedBrowsers.FireFox]: 'https://addons.mozilla.org/firefox/addon/ether-metamask/',
    [SupportedBrowsers.Chrome]:
      'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
  },
};
const polkadotConfig = {
  homeLink: 'https://polkadot.js.org/extension',
  installLinks: {
    [SupportedBrowsers.FireFox]: 'https://addons.mozilla.org/firefox/addon/polkadot-js-extension/',
    [SupportedBrowsers.Chrome]:
      'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
  },
};

export function extensionNotInstalled(extension: 'metamask' | 'polkadot'): InteractiveFeedback {
  const platformMetaData = getPlatformMetaData();
  let Logo: React.ComponentType = () => null;
  const config = extension === 'metamask' ? metaMaskConfig : polkadotConfig;
  switch (platformMetaData.id) {
    case SupportedBrowsers.Chrome:
      Logo = ChromeLogo;
      break;
    case SupportedBrowsers.FireFox:
      Logo = FireFoxLogo;
      break;
  }
  let interactiveFeedback: InteractiveFeedback;
  const extensionName = extension === 'metamask' ? 'MetaMask' : 'Polkadot';
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `${extensionName} extensions isn't installed`,
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
                  window.open(config.homeLink, '_blank');
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                  }}
                >
                  {extension === 'metamask' ? <MetaMaskLogo /> : <PolkaLogo />}
                </div>
                <Padding v x={0.5} />
                <Typography>k{extensionName} official website</Typography>
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
                  const url = config.installLinks[platformMetaData.id];
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
        interactiveFeedback?.cancel();
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
