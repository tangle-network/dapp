import { CircleIcon } from '@radix-ui/react-icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC } from 'react';
import { RelativePageUrl } from '../utils';
import HeaderControls from './HeaderControls';

const Header: FC = () => {
  return (
    <header className="py-4 flex flex-col-reverse sm:flex-row justify-between gap-4">
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <Link href={RelativePageUrl.Home}>
          <BreadcrumbsItem icon={<CircleIcon />}>
            <Typography variant="body1" fw="bold">
              ZK Explorer
            </Typography>
          </BreadcrumbsItem>
        </Link>

        <Link href={RelativePageUrl.SubmitProject}>
          <BreadcrumbsItem icon={<CircleIcon />} isLast>
            <Typography variant="body1" fw="bold">
              Upload Project
            </Typography>
          </BreadcrumbsItem>
        </Link>
      </Breadcrumbs>

      <HeaderControls />
    </header>
  );
};

export default Header;
