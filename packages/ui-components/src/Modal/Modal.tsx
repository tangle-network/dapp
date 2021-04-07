/* eslint-disable sort-keys */
import { createStyles, Theme } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import MuiModel, { ModalProps as MuiModalProps } from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';

// import PerfectScrollbar from 'react-perfect-scrollbar';

export interface ModalProps extends Omit<MuiModalProps, 'children'> {
  closeButton?: boolean;
  unlimitedWidth?: boolean;
  children: React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    paper: {
      position: 'absolute',
      width: 'auto',
      maxWidth: '100vw',
      [theme.breakpoints.up('sm')]: {
        minWidth: 450,
        top: 40,
        maxWidth: (props: any) => (props.unlimitedWidth ? 1200 : 750),
      },
      backgroundColor: theme.palette.background.paper,
      padding: 0,
      marginBottom: 40,
      borderRadius: '20px',
      overflow: 'hidden',
    },
    wrapper: {
      overflow: 'auto',
      padding: 0,
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // todo check this type
    //@ts-ignore
    fab: {
      position: 'absolute',
      top: `31px`,
      right: 10,
      transform: 'translate3d(-50%,-50%,0)',

      borderRadius: 0,
      width: 24,
      height: 24,
      background: 'transparent',
      display: 'inline-flex',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
      boxShadow: 'unset',
      outline: 0,
      padding: 0,
    },
  });
});

export const Modal: React.FC<ModalProps> = ({ children, unlimitedWidth, closeButton, ...props }) => {
  const classes = useStyles({
    unlimitedWidth,
  });
  return (
    <MuiModel
      style={{
        overflow: 'auto',
      }}
      className={classes.modal}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
      {...props}
    >
      <Slide in={props.open}>
        <div className={classes.paper}>
          <div className={classes.wrapper}>
            <>{children}</>
          </div>
          {closeButton && (
            <Tooltip title={'close'}>
              <button
                onClick={() => {
                  console.log('close', props.onClose);
                  // @ts-ignore
                  props.onClose && props.onClose();
                }}
                color='secondary'
                className={classes.fab}
              >
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12.5074 10L19.5575 2.94985C20.1475 2.35988 20.1475 1.35693 19.5575 0.766962L19.233 0.442478C18.6431 -0.147493 17.6401 -0.147493 17.0501 0.442478L10 7.49263L2.94985 0.442478C2.35988 -0.147493 1.35693 -0.147493 0.766962 0.442478L0.442478 0.766962C-0.147493 1.35693 -0.147493 2.35988 0.442478 2.94985L7.49263 10L0.442478 17.0501C-0.147493 17.6401 -0.147493 18.6431 0.442478 19.233L0.766962 19.5575C1.35693 20.1475 2.35988 20.1475 2.94985 19.5575L10 12.5074L17.0501 19.5575C17.6401 20.1475 18.6431 20.1475 19.233 19.5575L19.5575 19.233C20.1475 18.6431 20.1475 17.6401 19.5575 17.0501L12.5074 10Z'
                    fill='#C8CEDD'
                  />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
      </Slide>
    </MuiModel>
  );
};
