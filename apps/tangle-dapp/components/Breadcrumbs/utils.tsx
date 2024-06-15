import { isAddress } from '@polkadot/util-crypto';
import {
  ArrowLeftRightLineIcon,
  CheckboxBlankCircleLine,
  CodeFill,
  FundsLine,
  GiftLineIcon,
  GridFillIcon,
  TokenSwapLineIcon,
  WaterDropletIcon,
} from '@webb-tools/icons';
import { UserFillIcon } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { shortenString } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import capitalize from 'lodash/capitalize';
import { JSX } from 'react';

import { PagePath } from '../../types';

const BREADCRUMB_ICONS: Record<PagePath, (props: IconBase) => JSX.Element> = {
  [PagePath.CLAIM_AIRDROP]: GiftLineIcon,
  [PagePath.ACCOUNT]: UserFillIcon,
  [PagePath.NOMINATION]: FundsLine,
  [PagePath.SERVICES_OVERVIEW]: GridFillIcon,
  [PagePath.RESTAKE]: TokenSwapLineIcon,
  [PagePath.BRIDGE]: ArrowLeftRightLineIcon,
  [PagePath.LIQUID_RESTAKING]: WaterDropletIcon,
};

const BREADCRUMB_LABELS: Partial<Record<PagePath, string>> = {
  [PagePath.SERVICES_OVERVIEW]: 'Service Overview',
  [PagePath.CLAIM_AIRDROP]: 'Claim Airdrop',
};

const isSubstrateAddress = (address: string): boolean => {
  return isAddress(address);
};

const isPagePath = (pathName: string): pathName is PagePath => {
  return Object.values(PagePath).includes(pathName as PagePath);
};

const isSubPath = (
  page: PagePath,
  expectedIndex: number,
  expectedLength: number,
  actualIndex: number,
  pathNames: string[],
): boolean => {
  assert(
    expectedIndex < expectedLength && actualIndex < pathNames.length,
    'Index should be in bounds',
  );

  if (pathNames.length === 0) {
    return false;
  }

  const pagePath = '/' + pathNames[0];

  return (
    pagePath === page &&
    actualIndex === expectedIndex &&
    pathNames.length === expectedLength
  );
};

export const getBreadcrumbLabel = (
  pathName: string,
  index: number,
  pathNames: string[],
): string => {
  // Special case for the Service Details page.
  if (pathNames.length === 2 && index === 1 && pathNames[0] === 'services') {
    return `Details: ${pathName}`;
  }

  const pathNameWithSlash = '/' + pathName;

  const knownLabel = isPagePath(pathNameWithSlash)
    ? BREADCRUMB_LABELS[pathNameWithSlash]
    : undefined;

  if (knownLabel !== undefined) {
    return knownLabel;
  }
  // In the case that the pathname is a Substrate address, shorten it
  // to a more readable format, and to prevent overflow.
  else if (isSubstrateAddress(pathName)) {
    return shortenString(pathName);
  }
  // Otherwise, derive the label from the path name.
  else {
    // Replace dashes with spaces. These dashes may
    // be used to separate words in the URL. Then,
    // Capitalize the first letter of each word.
    return capitalize(pathName.split('-').join(' '));
  }
};

export const getBreadcrumbIcon = (
  pathName: string,
  index: number,
  pathNames: string[],
): ((props: IconBase) => JSX.Element) => {
  // Special case for the Service Details page.
  if (isSubPath(PagePath.SERVICES_OVERVIEW, 1, 2, index, pathNames)) {
    return CodeFill;
  }

  const pathNameWithSlash = '/' + pathName;

  const knownIcon = isPagePath(pathNameWithSlash)
    ? BREADCRUMB_ICONS[pathNameWithSlash]
    : undefined;

  if (knownIcon !== undefined) {
    return knownIcon;
  }

  return CheckboxBlankCircleLine;
};
