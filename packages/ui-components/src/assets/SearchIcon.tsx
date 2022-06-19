import React from 'react';

type SearchIconProps = React.SVGProps<SVGSVGElement>;

const SearchIcon: React.FC<SearchIconProps> = ({ height = '24px', width = '24px', ...restProps }) => {
  return (
    <svg width={width} height={height} viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg' {...restProps}>
      <path d='M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.59 0 1.17-.14 1.66-.41a1 1 0 0 0 .13.13l1 1a1.02 1.02 0 1 0 1.44-1.44l-1-1a1 1 0 0 0-.16-.13c.27-.49.44-1.06.44-1.66 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .66-.24 1.27-.66 1.72-.01.01-.02.02-.03.03a1 1 0 0 0-.13.13c-.44.4-1.04.63-1.69.63-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5z' />
    </svg>
  );
};

export default SearchIcon;
