import { twMerge } from 'tailwind-merge';
import type { PropsOf } from '../../types';
import { Typography } from '../../typography/Typography/Typography';
import type { AppTemplateTitleProps } from './types';
import { type ElementRef, type FC, forwardRef } from 'react';

const AppTemplateRoot = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge(
          'px-4 md:px-12 py-12 w-full max-w-5xl rounded-2xl mx-auto',
          'border-4 border-mono-0 dark:border-mono-170',
          'bg-transparent',
          className,
        )}
      />
    );
  },
);

AppTemplateRoot.displayName = 'AppTemplateRoot';

const AppTemplateContent = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge('max-w-xl mx-auto', className)}
      />
    );
  },
);

AppTemplateContent.displayName = 'AppTemplateContent';

const AppTemplateTitle = forwardRef<ElementRef<'div'>, AppTemplateTitleProps>(
  (
    {
      title,
      overrideSubTitleProps = { variant: 'mkt-small-caps' },
      overrideTitleProps = { variant: 'mkt-h3' },
      subTitlePosition = 'top',
      subTitle,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div {...props} ref={ref} className={twMerge('mb-4', className)}>
        {subTitlePosition === 'top' ? (
          <Typography
            variant="mkt-small-caps"
            {...overrideSubTitleProps}
            className={twMerge(
              'font-black text-center',
              overrideSubTitleProps.className,
            )}
          >
            {subTitle}
          </Typography>
        ) : null}

        <Typography
          variant="mkt-h3"
          {...overrideTitleProps}
          className={twMerge(
            'font-black text-center text-mono-200',
            overrideTitleProps.className,
          )}
        >
          {title}
        </Typography>

        {subTitlePosition === 'bottom' ? (
          <Typography
            variant="mkt-small-caps"
            {...overrideSubTitleProps}
            className={twMerge(
              'font-black text-center',
              overrideSubTitleProps.className,
            )}
          >
            {subTitle}
          </Typography>
        ) : null}
      </div>
    );
  },
);

AppTemplateTitle.displayName = 'AppTemplateTitle';

const AppTemplateDescriptionContainer = forwardRef<
  ElementRef<'div'>,
  PropsOf<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge('flex flex-col gap-4', className)}
    />
  );
});

AppTemplateDescriptionContainer.displayName = 'AppTemplateDescriptionContainer';

const AppTemplateDescription: FC<Partial<PropsOf<typeof Typography>>> = (
  props,
) => {
  const variant = props.variant ?? 'mkt-body1';

  return (
    <Typography
      variant={variant}
      {...props}
      className={twMerge(
        'font-medium text-center text-mono-140',
        props.className,
      )}
    />
  );
};

const AppTemplateBody = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge('mt-10 space-y-4', className)}
      />
    );
  },
);

const AppTemplate = Object.assign(
  {},
  {
    Root: AppTemplateRoot,
    Content: AppTemplateContent,
    Title: AppTemplateTitle,
    DescriptionContainer: AppTemplateDescriptionContainer,
    Description: AppTemplateDescription,
    Body: AppTemplateBody,
  },
);

export {
  AppTemplate,
  AppTemplateRoot,
  AppTemplateRoot as Root,
  AppTemplateContent as AppTemplateContent,
  AppTemplateContent as Content,
  AppTemplateTitle,
  AppTemplateTitle as Title,
  AppTemplateDescriptionContainer,
  AppTemplateDescriptionContainer as DescriptionContainer,
  AppTemplateDescription,
  AppTemplateDescription as Description,
  AppTemplateBody,
  AppTemplateBody as Body,
};
