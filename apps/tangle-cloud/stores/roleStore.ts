import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Role {
  OPERATOR = 'operator',
  DEPLOYER = 'deployer',
}

export interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: Role.DEPLOYER,
      setRole: (role) => set(() => ({ role })),
    }),
    {
      name: 'role',
    },
  ),
);

export default useRoleStore;
