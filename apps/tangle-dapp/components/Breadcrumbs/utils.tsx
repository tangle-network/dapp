import { isAddress } from '@polkadot/util-crypto';
import {
  CodeFill,
  CoinLine,
  GiftLineIcon,
  GridFillIcon,
  ShuffleLine,
  TokenSwapFill,
  WaterDropletIcon,
} from '@webb-tools/icons';
import { UserFillIcon } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { shortenString } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import capitalize from 'lodash/capitalize';
import { JSX } from 'react';

import { LST_PREFIX } from '../../constants/liquidStaking/constants';
import { PagePath } from '../../types';

const BREADCRUMB_ICONS: Record<PagePath, (props: IconBase) => JSX.Element> = {
  [PagePath.CLAIM_AIRDROP]: GiftLineIcon,
  [PagePath.ACCOUNT]: UserFillIcon,
  [PagePath.NOMINATION]: CoinLine,
  [PagePath.BLUEPRINTS]: GridFillIcon,
  [PagePath.SERVICES]: GridFillIcon,
  [PagePath.RESTAKE]: TokenSwapFill,
  [PagePath.RESTAKE_DEPOSIT]: TokenSwapFill,
  [PagePath.RESTAKE_DELEGATE]: TokenSwapFill,
  [PagePath.BRIDGE]: ShuffleLine,
  [PagePath.LIQUID_STAKING]: WaterDropletIcon,
};

const BREADCRUMB_LABELS: Partial<Record<PagePath, string>> = {
  [PagePath.SERVICES]: 'Service Overview',
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
  if (
    pathNames.length === 2 &&
    index === 1 &&
    pathNames[0] === PagePath.SERVICES.substring(1)
  ) {
    return `Details: ${pathName}`;
  }
  // Special case for Liquid Staking individual token pages.
  // Show it as something like `tgDOT` instead of `Dot`.
  else if (
    pathNames.length === 2 &&
    index === 1 &&
    pathNames[0] === PagePath.LIQUID_STAKING.substring(1)
  ) {
    return `${LST_PREFIX}${pathName.toUpperCase()}`;
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
  if (isSubstrateAddress(pathName)) {
    return shortenString(pathName);
  }

  // decode special character encoding  (Ex: "%20" -> " ")
  return capitalize(decodeURI(pathName));
};

export const getBreadcrumbIcon = (
  pathName: string,
  index: number,
  pathNames: string[],
): ((props: IconBase) => JSX.Element) | null => {
  // Special case for the Service Details page.
  if (isSubPath(PagePath.SERVICES, 1, 2, index, pathNames)) {
    return CodeFill;
  }

  const pathNameWithSlash = '/' + pathName;

  const knownIcon = isPagePath(pathNameWithSlash)
    ? BREADCRUMB_ICONS[pathNameWithSlash]
    : undefined;

  return knownIcon ?? null;
};
