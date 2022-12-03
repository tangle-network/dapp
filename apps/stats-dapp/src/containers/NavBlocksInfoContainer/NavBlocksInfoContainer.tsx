import { useMemo } from 'react';
import {
  GridFillIcon,
  KeyIcon,
  ShieldKeyholeIcon,
  TeamFillIcon,
  UserStarFillIcon,
  FoldersFillIcon,
  FileCodeLineIcon,
  GraphIcon,
} from '@webb-tools/icons';
import { Breadcrumbs, BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { NavLink, useLocation } from 'react-router-dom';

export const NavBoxInfoContainer = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentPage = useMemo(() => pathnames[0], [pathnames]);
  const subPage = useMemo(() => pathnames[1], [pathnames]);

  return (
    <div className="flex items-center justify-between py-2 mb-4 max-w-[1160px] mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <NavLink to="/">
          <BreadcrumbsItem icon={<GridFillIcon />}>
            Tangle Explorer
          </BreadcrumbsItem>
        </NavLink>
        <NavLink to={pathnames.length > 1 ? `/${currentPage}` : ''}>
          <BreadcrumbsItem
            icon={
              currentPage === 'keys' ? (
                <KeyIcon />
              ) : currentPage === 'authorities' ? (
                <TeamFillIcon />
              ) : currentPage === 'proposals' ? (
                <FoldersFillIcon />
              ) : null
            }
            isLast={pathnames.length === 1 ? true : false}
          >
            {currentPage === 'keys'
              ? 'Keys Overview'
              : currentPage === 'authorities'
              ? 'Authorities Overview'
              : currentPage === 'proposals'
              ? 'Proposals Overview'
              : ''}
          </BreadcrumbsItem>
        </NavLink>
        {pathnames.length > 1 && (
          <BreadcrumbsItem
            icon={
              currentPage === 'keys' ? (
                <ShieldKeyholeIcon />
              ) : currentPage === 'authorities' && subPage !== 'history' ? (
                <UserStarFillIcon />
              ) : currentPage === 'authorities' && subPage === 'history' ? (
                <GraphIcon />
              ) : currentPage === 'proposals' ? (
                <FileCodeLineIcon />
              ) : null
            }
            isLast
          >
            {currentPage === 'keys'
              ? 'Keygen details'
              : currentPage === 'authorities' && subPage !== 'history'
              ? 'Authority details'
              : currentPage === 'authorities' && subPage === 'history'
              ? 'History'
              : currentPage === 'proposals'
              ? 'Proposal details'
              : ''}
          </BreadcrumbsItem>
        )}
      </Breadcrumbs>

      {/* Blocks Info */}
      {/* <div>Finalized | Best | Session</div> */}
    </div>
  );
};
