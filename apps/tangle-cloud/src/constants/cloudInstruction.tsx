import { CloudOutlineIcon, GlobalLine } from '@tangle-network/icons';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import { PagePath } from '../types';

export const CLOUD_INSTRUCTIONS = [
  {
    title: 'Getting started with Tangle Cloud',
    description: 'Learn how to set up and manage decentralized services.',
    icon: CloudOutlineIcon,
    to: 'https://docs.tangle.tools/developers/blueprints/introduction',
    className: 'h-6 w-6',
    external: true,
  },
  {
    title: 'Item',
    description: 'Register as an Operator to participate in managing services.',
    icon: GlobalLine,
    to: PagePath.OPERATORS,
    className: 'h-6 w-6',
    external: false,
  },
  {
    title: 'Register and run Blueprints',
    description:
      'Browse available Blueprints to select services you can operate and support.',
    icon: GridFillIcon,
    to: PagePath.BLUEPRINTS,
    className: 'h-6 w-6',
    external: false,
  },
];
