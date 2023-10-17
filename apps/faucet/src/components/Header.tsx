import { FaucetIcon, ThreeDotsVerticalIcon } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  SideBarMenu,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import sideBarProps from '../constants/sidebar';

const Header: FC = () => {
  return (
    <header className="flex items-center justify-between pt-6 pb-4">
      <div className="flex items-center gap-2">
        <SideBarMenu {...sideBarProps} className="lg:hidden" />
        <Breadcrumbs className="hidden md:block">
          <BreadcrumbsItem icon={<FaucetIcon />} isLast={true}>
            Faucet
          </BreadcrumbsItem>
        </Breadcrumbs>
      </div>

      {/* <HeaderChipsContainer /> */}
      <div className="flex items-center gap-2">
        <Button>Webb dApp</Button>
        <ThreeDotsVerticalIcon size="lg" />
      </div>
    </header>
  );
};

export default Header;
