import { GearIcon } from '@radix-ui/react-icons';
import { IconBase } from '@tangle-network/icons/types';
import { UploadCloudIcon } from '@tangle-network/icons/UploadCloudIcon';
import { getIconSizeInPixel } from '@tangle-network/icons/utils';
import { twMerge } from 'tailwind-merge';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Role {
  OPERATOR = 'operator',
  DEPLOYER = 'deployer',
}

export const ROLE_ICON_MAP = {
  [Role.OPERATOR]: (props?: IconBase) => (
    <GearIcon
      width={getIconSizeInPixel(props?.size ?? 'md')}
      height={getIconSizeInPixel(props?.size ?? 'md')}
      className={twMerge('ml-auto', props?.className)}
    />
  ),
  [Role.DEPLOYER]: (props?: IconBase) => (
    <UploadCloudIcon
      {...props}
      className={twMerge('!fill-current ml-auto', props?.className)}
    />
  ),
} as const;

export interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: Role.OPERATOR,
      setRole: (role) => set(() => ({ role })),
    }),
    {
      name: 'role',
    },
  ),
);

export default useRoleStore;
