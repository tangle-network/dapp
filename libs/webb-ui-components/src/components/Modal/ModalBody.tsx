import { FC, PropsWithChildren } from 'react';

export const ModalBody: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col items-stretch justify-center gap-5 p-9">
      {children}
    </div>
  );
};
