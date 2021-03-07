import { Fab, IconButton, InputBase, Popper } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import MenuItem from '@material-ui/core/MenuItem';
import RootRef from '@material-ui/core/RootRef';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { LogEvent, LoggerService, LogLevel } from '@webb-tools/app-util';
import { useClientCache } from '@webb-dapp/react-hooks/withdraw/useClientCachedStore';

import MuiMenu, { MenuProps as MuiMenuProps } from '@material-ui/core/Menu';

export type MenuProps = {
  renderItems: (handleClose: Function) => JSX.Element;
  renderButton: (handleClick: Function) => JSX.Element;
} & Partial<MuiMenuProps>;
export const Menu: React.FC<MenuProps> = ({ renderItems, renderButton }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = useCallback((event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {renderButton(handleClick)}

      <MuiMenu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        children={renderItems(handleClose)}
      />
    </div>
  );
};

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {},
    function (err) {
      console.error('Async: Could not copy text: ', err);
    }
  );
}

const Pop = styled.div`
  height: 50vh;
  width: 99vw;
  left: 0;
  bottom: 0;
  position: fixed;
  background: #333;
  color: #fff !important;
  overflow: hidden;
  input {
    color: #fff !important;
  }

  direction: ltr;
  transform: unset;
  z-index: 99;

  .logger-controller {
    height: 60px;
  }

  .logs-container {
    position: relative;
    height: calc(100% - 60px);
    overflow: auto;
    padding: 0 10px;
  }
  .copy-logs {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
  }
`;
const LoggerUIWrapper = styled.div`
  .logger-fab {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 999999999999;
  }
`;
type LoggerUIProps = {};
const logLevelIntoColor = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.trace:
      return `var(--text-color-second)`;
    case LogLevel.log:
      return `var(--border-color)`;
    case LogLevel.info:
      return `var(--color-success)`;
    case LogLevel.warn:
      return `var(--color-yellow)`;
    case LogLevel.debug:
      return `var(--color-red-light)`;
    case LogLevel.error:
      return `var(--color-red)`;
  }
};
let _logs = [];
let _q = '';
let _l = null;
const DAppLogger: React.FC<LoggerUIProps> = ({}) => {
  const $fab = useRef<HTMLButtonElement>();
  const [v, s] = useClientCache('logger');
  const [level, setLevel] = useState<LogLevel | null>(v?.level ?? null);
  const [query, setQuery] = useState(v?.query ?? '');
  const [__logs, setLogs] = useState<LogEvent['log'][]>(_logs as any);
  useEffect(() => {
    s({
      level,
      query,
    });
  }, [level, query]);
  useEffect(() => {
    LoggerService.eventBus.on('log', (log) => {
      console.log(log, 'logger');
      if (log) {
        setLogs((p) => {
          _logs = [...p, log];
          return [...p, log];
        });
      }
    });
  }, []);
  const logs = useMemo(() => {
    return __logs.filter((log) => {
      let levelPass = true;
      if (level) {
        levelPass = log.level === level;
      }

      if (query) {
        return (
          log.ctx.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1 ||
          log.log.toLowerCase().indexOf(query.toLocaleLowerCase()) > -1
        );
      }
      return levelPass;
    });
  }, [level, query, __logs]);
  const [open, setOpen] = useState(false);
  return (
    <LoggerUIWrapper>
      <RootRef rootRef={$fab}>
        <Fab color='secondary' className='logger-fab' onClick={() => setOpen((p) => !p)}>
          <Icon>bug_report</Icon>
        </Fab>
      </RootRef>
      <Pop as={Popper} open={open} anchorEl={$fab.current}>
        <div className='logger-controller'>
          <InputBase
            fullWidth
            placeholder={'search logs'}
            value={query}
            onChange={({ target: { value } }) => {
              setQuery(value);
            }}
            endAdornment={
              <div>
                <Menu
                  renderItems={(close) => {
                    return (
                      <>
                        <MenuItem
                          selected={level === LogLevel.trace}
                          onClick={() => {
                            setLevel(LogLevel.trace);
                            close();
                          }}
                        >
                          <span>Trace</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === LogLevel.debug}
                          onClick={() => {
                            setLevel(LogLevel.debug);
                            close();
                          }}
                        >
                          <span>Debug</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === LogLevel.info}
                          onClick={() => {
                            setLevel(LogLevel.info);
                            close();
                          }}
                        >
                          <span>Info</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === LogLevel.warn}
                          onClick={() => {
                            setLevel(LogLevel.warn);
                            close();
                          }}
                        >
                          <span>Warn</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === LogLevel.error}
                          onClick={() => {
                            setLevel(LogLevel.error);
                            close();
                          }}
                        >
                          <span>Error</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === LogLevel.log}
                          onClick={() => {
                            setLevel(LogLevel.log);
                            close();
                          }}
                        >
                          <span>Log</span>
                        </MenuItem>
                        <MenuItem
                          selected={level === null}
                          onClick={() => {
                            setLevel(null);
                            close();
                          }}
                        >
                          All
                        </MenuItem>
                      </>
                    );
                  }}
                  renderButton={(open) => (
                    <IconButton onClick={open}>
                      <Icon color={'primary'}>list_filter</Icon>
                    </IconButton>
                  )}
                />
              </div>
            }
          />
        </div>
        <div className='logs-container'>
          {logs.map((log) => (
            <div className={'log-wrapper'}>
              <Button
                variant={'text'}
                onClick={() => {
                  copyTextToClipboard(`[${log.ctx}] : ${log.log}`);
                }}
              >
                <span> {log.ctx}</span>
              </Button>
              <div>
                <pre
                  style={{
                    color: logLevelIntoColor(log.level),
                  }}
                >
                  {log.log}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <Fab
          onClick={() => {
            copyTextToClipboard(logs.map((log) => `[${log.ctx}] : ${log.log}`).join(`\n`));
          }}
          className='copy-logs'
        >
          <Icon>content_copy</Icon>
        </Fab>
      </Pop>
    </LoggerUIWrapper>
  );
};
export default DAppLogger;
