'use client';

import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import useRoleStore, { Role } from '../../stores/roleStore';
import {
  BLUEPRINTS_OPERATOR_DESCRIPTION,
  BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT,
  BLUEPRINTS_OPERATOR_TITLE,
} from '@webb-tools/tangle-shared-ui/constants';
import BlueprintListing from './BlueprintListing';

export const dynamic = 'force-static';

const ROLE_TITLE = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_TITLE,
  [Role.DEPLOYER]: 'Deploy your first',
} satisfies Record<Role, string>;

const ROLE_HIGHLIGHTED_TEXT = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT,
  [Role.DEPLOYER]: 'Instance',
} satisfies Record<Role, string>;

const ROLE_DESCRIPTION = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_DESCRIPTION,
  [Role.DEPLOYER]:
    'Select a Blueprint, customize settings, and deploy your decentralized service instance in minutes.',
} satisfies Record<Role, string>;

const Page = () => {
  const { role } = useRoleStore();

  return (
    <div className="space-y-5">
      <TopBanner
        title={ROLE_TITLE[role]}
        highlightedText={ROLE_HIGHLIGHTED_TEXT[role]}
        description={ROLE_DESCRIPTION[role]}
      />

      <BlueprintListing />
    </div>
  );
};

export default Page;
