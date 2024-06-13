import { FC, ReactNode } from 'react';

const HoverButtonStyle: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-center rounded-md px-3 py-1 hover:bg-mono-160 cursor-pointer">
      {children}
    </div>
  );
};

export default HoverButtonStyle;
