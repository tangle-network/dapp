import React from 'react';

type CloseIconProps = React.SVGProps<SVGSVGElement>;

const CloseIcon: React.FC<CloseIconProps> = ({
  height = '16px',
  stroke = '#000',
  strokeWidth = 3,
  width = '16px',
  ...restProps
}) => {
  return (
    <svg
      width={width}
      height={height}
      stroke={stroke}
      viewBox='0 0 24 24'
      strokeWidth={strokeWidth}
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}
    >
      <path d='M3,3 L21,21 M3,21 L21,3' />
    </svg>
  );
};

export default CloseIcon;
