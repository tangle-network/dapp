import {
  GridFill,
  Key,
  ShieldKeyhole,
  TeamFill,
  UserStarFill,
  FoldersFill,
  FileCodeLine,
} from '@webb-tools/icons';
import { Breadcrumbs, BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { ArrowRight } from '@webb-tools/icons';

export const NavBoxInfoContainer = () => {
  return (
    <div className="flex items-center justify-between py-2 mb-4 max-w-[1160px] mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbsItem icon={<ArrowRight />} path="/">
          Hello
        </BreadcrumbsItem>
        <BreadcrumbsItem icon={<ArrowRight />} path="/keys">
          World
        </BreadcrumbsItem>
        <BreadcrumbsItem icon={<ArrowRight />}>Web3</BreadcrumbsItem>
      </Breadcrumbs>

      {/* Blocks Info */}
      <div>Blocks Info</div>
    </div>
  );
};
