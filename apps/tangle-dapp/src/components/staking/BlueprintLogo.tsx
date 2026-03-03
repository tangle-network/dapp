import { FC, useState } from 'react';

type Props = {
  name: string;
  url?: string;
  size: 'sm' | 'lg';
};

const LOGO_SIZES = {
  sm: 'w-5 h-5',
  lg: 'w-10 h-10',
} as const;

const FALLBACK_LOGO_URL =
  'https://avatars.githubusercontent.com/u/76852793?s=200&v=4';

const BlueprintLogo: FC<Props> = ({ name, url, size }) => {
  const [imgSrc, setImgSrc] = useState(url ?? FALLBACK_LOGO_URL);

  return (
    <div>
      <img
        src={imgSrc}
        alt={`${name}'s logo`}
        className={LOGO_SIZES[size]}
        onError={() => setImgSrc(FALLBACK_LOGO_URL)}
      />
    </div>
  );
};

export default BlueprintLogo;
