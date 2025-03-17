import { CloudOutlineIcon, GlobalLine } from '@tangle-network/icons';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import { PagePath } from '../types';

const ICON_CLASSNAME = 'h-6 w-6 fill-mono-120 !dark:fill-mono-0';

export const CLOUD_INSTRUCTIONS = [
  {
    title: 'Getting started with Tangle Cloud',
    description: 'Learn how to set up and manage decentralized services.',
    icon: CloudOutlineIcon,
    to: 'https://docs.tangle.tools/developers/blueprints/introduction',
    className: ICON_CLASSNAME,
    external: true,
  },
  {
    title: 'Item',
    description: 'Register as an Operator to participate in managing services.',
    icon: GlobalLine,
    to: PagePath.OPERATORS,
    className: ICON_CLASSNAME,
    external: false,
  },
  {
    title: 'Register and run Blueprints',
    description:
      'Browse available Blueprints to select services you can operate and support.',
    icon: GridFillIcon,
    to: PagePath.BLUEPRINTS,
    className: ICON_CLASSNAME,
    external: false,
  },
];
