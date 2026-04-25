import { CloudOutlineIcon, GlobalLine } from '@tangle-network/icons';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import { PagePath } from '../types';

export const CLOUD_INSTRUCTIONS = [
  {
    title: 'Register operator capacity',
    description:
      'Attach an operator to blueprints and serve customer requests.',
    icon: GlobalLine,
    to: PagePath.OPERATORS,
    external: false,
  },
  {
    title: 'Deploy an instance',
    description:
      'Choose a blueprint, select operators, and submit the service order.',
    icon: GridFillIcon,
    to: PagePath.BLUEPRINTS,
    external: false,
  },
  {
    title: 'Implementation docs',
    description: 'Blueprint, operator, and service-instance references.',
    icon: CloudOutlineIcon,
    to: 'https://docs.tangle.tools/developers/blueprints/introduction',
    external: true,
  },
];
