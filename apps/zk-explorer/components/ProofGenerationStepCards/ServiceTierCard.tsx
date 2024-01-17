import { Button, Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Plan } from './types';

type ServiceTierCardProps = {
  plan: Plan;
  description: string;
  benefits: string[];
  monthlyPrice: number | null;
  isSelected?: boolean;
  onSelect: (plan: Plan) => void;
};

const ServiceTierCard: FC<ServiceTierCardProps> = ({
  plan,
  monthlyPrice,
  description,
  benefits,
  isSelected = false,
  onSelect,
}) => {
  const billingText =
    monthlyPrice === null
      ? null
      : monthlyPrice > 0
      ? `Billed $${monthlyPrice * 12}/year`
      : 'Free';

  return (
    <Card className="flex flex-col gap-1 space-y-0 rounded-2xl w-full dark:bg-mono-160 px-6 py-3">
      <Typography variant="h4" fw="bold" className="dark:text-mono-0">
        {plan}
      </Typography>

      <Typography variant="body1">{description}</Typography>

      {monthlyPrice !== null && (
        <>
          <div className="flex items-center">
            <Typography variant="h4" fw="bold">
              ${monthlyPrice}
            </Typography>

            <Typography variant="body1" fw="normal">
              /mo
            </Typography>
          </div>

          <Typography variant="body1" fw="normal">
            {billingText}
          </Typography>
        </>
      )}

      <ul className="list-disc pl-5">
        {benefits.map((benefit, index) => (
          <li className="list-item" key={index}>
            {benefit}
          </li>
        ))}
      </ul>

      <Button
        isDisabled={isSelected}
        onClick={() => onSelect(plan)}
        className="ml-auto"
        variant={monthlyPrice === null ? 'secondary' : 'primary'}
      >
        {monthlyPrice === null
          ? 'Contact Us'
          : isSelected
          ? 'Selected'
          : 'Select Plan'}
      </Button>
    </Card>
  );
};

export default ServiceTierCard;
