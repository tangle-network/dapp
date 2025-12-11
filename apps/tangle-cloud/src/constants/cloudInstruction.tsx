import { CloudOutlineIcon, GlobalLine } from '@tangle-network/icons';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import { PagePath } from '../types';

export const CLOUD_INSTRUCTIONS = [
  {
    title: 'Become an Operator',
    description: 'Start earning by running decentralized services on Tangle.',
    icon: GlobalLine,
    to: PagePath.OPERATORS,
    external: false,
  },
  {
    title: 'Browse Blueprints',
    description: 'Discover and deploy available service blueprints.',
    icon: GridFillIcon,
    to: PagePath.BLUEPRINTS,
    external: false,
  },
  {
    title: 'Read the Docs',
    description: 'Learn how to build and operate services on Tangle.',
    icon: CloudOutlineIcon,
    to: 'https://docs.tangle.tools/developers/blueprints/introduction',
    external: true,
  },
];
