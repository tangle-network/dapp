import { FC, ReactNode } from 'react';

export type AvatarListProps = {
  children: ReactNode;
};

const AvatarList: FC<AvatarListProps> = ({ children }) => {
  return (
    <div className="flex -space-x-2 items-center justify-center">
      {children}
    </div>
  );
};

export default AvatarList;
