import { SocialsProps } from './types';
import { socialConfigs } from '../../constants';

export const Socials = (props: SocialsProps) => {
  const { iconPlacement = 'start' } = props;

  const className = `flex items-center justify-${iconPlacement} space-x-4`;

  return (
    <div className={className}>
      {socialConfigs.map(({ Icon, name, ...linkProps }) => (
        <a
          key={name}
          {...linkProps}
          className="text-mono-180 dark:text-mono-0 hover:text-mono-140 dark:hover:text-mono-100"
        >
          <Icon className="w-8 h-8 !fill-current" />
        </a>
      ))}
    </div>
  );
};
