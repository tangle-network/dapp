import React, { FC, createRef, useMemo, useLayoutEffect } from 'react';

import { BulletBarConfigItem, drawBulletBar } from './bullet-bar-helper';
import classes from './BulletBar.module.scss';

interface BulletBarProps {
  config: BulletBarConfigItem[];
}

export const BulletBar: FC<BulletBarProps> = ({ config }) => {
  const ref = createRef<HTMLDivElement>();

  const sortedConfig = useMemo(
    () => config.slice().sort((a: BulletBarConfigItem, b: BulletBarConfigItem): number => a.data - b.data),
    [config]
  );

  useLayoutEffect(() => {
    if (!ref.current) return;

    const $e = ref.current;

    drawBulletBar($e, config);
  }, [config, ref]);

  return (
    <div className={classes.root}>
      <div ref={ref} />
      <ul className={classes.labelArea}>
        {
          sortedConfig.map((item: BulletBarConfigItem): JSX.Element => {
            return (
              <li className={classes.label}
                data-color={item.color}
                key={`label-${item.label}`}>
                <div className={classes.decoration}
                  style={{ background: item.color }} />
                {item.label}
                <span className={classes.status}
                  style={{ color: item.color }}>{item.labelStatus}</span>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};
