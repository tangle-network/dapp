import { ArrowRightUp } from '@tangle-network/icons';
import { Button } from '@tangle-network/ui-components';

export const StakingItemExternalLinkButton = ({ href }: { href: string }) => {
  return (
    <Button
      variant="utility"
      className="bg-blue-0 dark:bg-blue-120"
      href={href}
      target="_blank"
    >
      <ArrowRightUp
        width={16}
        height={16}
        className="fill-blue-60 dark:fill-blue-40"
      />
    </Button>
  );
};
