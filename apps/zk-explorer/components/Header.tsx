import {
  useWebContext,
  useConnectWallet,
} from '@webb-tools/api-provider-environment';
import { Input, WalletButton, Dropdown, DropdownBasicButton, DropdownBody, MenuItem, Typography, Breadcrumbs, BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { ThreeDotsVerticalIcon, Search, BookOpenLineIcon, CheckboxBlankCircleLine, ExternalLinkLine, MetaMaskIcon } from '@webb-tools/icons';
import { WalletConfig } from '@webb-tools/dapp-config';

export const Header: FC<> = () => {
  // const { activeAccount, activeWallet, loading, isConnecting } =
  //   useWebContext();

  // TODO: In the future, make use the `useWebContext` hook to get the active wallet instead of mocking it
  const debugWallet: WalletConfig = {
    id: 0,
    name: 'Webb',
    title: 'Webb',
    Logo: <MetaMaskIcon />,
    platform: 'EVM',
    enabled: true,
    homeLink: 'https://webb.tools',
    // TODO: Can't create a wallet without detect function, but Next.js is complaining if a mock function is used
    // detect: async () => Promise.resolve(undefined),
    supportedChainIds: []
  }

  return (
    <header className="py-4 flex">
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-60" variant="body1" fw="bold">ZK Explorer</Typography>
        </BreadcrumbsItem>

        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-0" variant="body1" fw="bold">Upload Project</Typography>
        </BreadcrumbsItem>
      </Breadcrumbs>

      <div className="flex gap-2 ml-auto items-center">
        <Input
          id="search item"
          placeholder="Search item"
          rightIcon={<Search />}
        />

        <WalletButton
          wallet={debugWallet}
          address="0x1234567890123456789012345678901234567890"
          addressClassname="hidden lg:!block"
        />

        <Dropdown className="flex items-center justify-center">
          <DropdownBasicButton>
            <ThreeDotsVerticalIcon size="lg" />
          </DropdownBasicButton>

          <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
            <div className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
              <Typography variant="label" fw="bold">
                Advanced
              </Typography>

              <Typography variant="body1" className="pt-4">
                Data Source
              </Typography>
            </div>
          </DropdownBody>
        </Dropdown>
      </div>
    </header>
  )
}
