import React, { FC, useCallback, useContext, useState, useEffect } from 'react';
import { Form, Skeleton } from 'antd';

import { Fixed18 } from '@acala-network/app-util';

import {
  Network,
  NetworkType,
  getNetworkName,
  FormatBalance,
  TxButton,
  numToFixed18Inner,
  UserAssetBalance,
  getCurrencyIdFromName
} from '@webb-dapp/react-components';
import { useAccounts, useApi } from '@webb-dapp/react-hooks';
import { CrossChainProvider, CrossChainContextData, CrossChainContext } from '@webb-dapp/react-environment';
import { Card, IconButton } from '@webb-dapp/ui-components';

import classes from './DOT.module.scss';
import { AddressFromInput, AddressToInput } from './AddressInput';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type TransferDirection = 'in' | 'out';

interface SelectNetworkProps {
  value?: TransferDirection;
  onChange?: (value: TransferDirection) => void;
}

const SelectNetwork: FC<SelectNetworkProps> = ({ onChange, value }) => {
  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(value === 'in' ? 'out' : 'in');
    }
  }, [onChange, value]);

  const renderNetwork = useCallback((network: NetworkType) => {
    return (
      <div className={classes.networkItem}>
        <Network type={network} />
        <p>{getNetworkName(network)}</p>
      </div>
    );
  }, []);

  return (
    <div className={classes.network}>
      {value === 'in' ? renderNetwork('rococo') : renderNetwork('acala')}
      <IconButton icon='swap' onClick={handleChange} type='ghost' />
      {value === 'out' ? renderNetwork('rococo') : renderNetwork('acala')}
    </div>
  );
};

export const TransferIn: FC = () => {
  const { connected, getApi, getNativeBalance } = useContext<CrossChainContextData>(CrossChainContext);
  const { active } = useAccounts();
  const [nativeBalance, setNativaBalance] = useState<Fixed18>(Fixed18.ZERO);
  const [form] = Form.useForm();

  const handleSuccess = useCallback(() => {
    form.resetFields();
  }, [form]);

  const preCheck = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    return true;
  }, [form]);

  const getParams = useCallback(() => {
    const value = form.getFieldsValue();

    return [5000, value.amount * 10 ** 12 + '', ''];
  }, [form]);

  useEffect(() => {
    if (!connected) return;
    if (!active?.address) return;

    const subscriber = getNativeBalance(active.address).subscribe((result) => {
      setNativaBalance(result);
    });

    return (): void => {
      subscriber.unsubscribe();
    };
  }, [setNativaBalance, connected, active, getNativeBalance]);

  if (!connected) {
    return (
      <div>
        <p className={classes.loadingTips}>Connecting To ROCOCO...</p>
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      </div>
    );
  }

  return (
    <Form form={form} {...formLayout}>
      <FormItem label='Account'>
        <AddressFromInput from={active?.address} to={active?.address} />
      </FormItem>
      <FormItem
        extra={
          <div className={classes.amountExtra}>
            <p>Available</p>
            <FormatBalance balance={nativeBalance} currency={'DOT'} />
          </div>
        }
        name='amount'
        rules={[
          {
            message: 'Please Input Amount',
            required: true
          },
          {
            max: nativeBalance.toNumber(),
            message: 'Insufficient Balance',
            min: 0,
            type: 'number'
          }
        ]}
      ></FormItem>
      <FormItem>
        {getApi() ? (
          <TxButton
            api={getApi()}
            className={classes.txBtn}
            method='transferToParachain'
            onInblock={handleSuccess}
            params={getParams}
            preCheck={preCheck}
            section='parachains'
          >
            Transfer
          </TxButton>
        ) : null}
      </FormItem>
    </Form>
  );
};

export const TransferOut: FC = () => {
  const { api } = useApi();
  const { active } = useAccounts();
  const [form] = Form.useForm();

  // const balanceValidator = useBalanceValidator({
  //   currency: getCurrencyIdFromName(api, 'DOT')
  // });

  const getParams = useCallback((): any[] => {
    const values = form.getFieldsValue();

    return [values.transferOut, numToFixed18Inner(values.amount)];
  }, [form]);

  const preCheck = useCallback(async (): Promise<boolean> => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    return true;
  }, [form]);

  const handleSuccess = useCallback(() => {
    form.resetFields();
  }, [form]);

  return (
    <Form {...formLayout} form={form}>
      <FormItem label='Account' name='transferOut'>
        <AddressToInput from={active?.address} />
      </FormItem>
      <FormItem
        extra={
          <div className={classes.amountExtra}>
            <p>Available</p>
            <UserAssetBalance currency={getCurrencyIdFromName(api, 'DOT')} />
          </div>
        }
        name='amount'
      ></FormItem>
      <TxButton
        className={classes.txBtn}
        method='transferToRelayChain'
        onInblock={handleSuccess}
        params={getParams}
        preCheck={preCheck}
        section='xTokens'
      >
        Transfer
      </TxButton>
    </Form>
  );
};

export const _DOT: FC = () => {
  const [direction, setDirection] = useState<TransferDirection>('in');

  const renderTitle = useCallback(() => {
    if (direction === 'in') {
      return 'Transfer DOT from Polkadot to Acala';
    }

    return 'Transfer DOT from Acala to Polkadot';
  }, [direction]);

  return (
    <Card>
      <div className={classes.root}>
        <div className={classes.container}>
          <p className={classes.title}>{renderTitle()}</p>
          <SelectNetwork onChange={setDirection} value={direction} />
          {direction === 'in' ? <TransferIn /> : <TransferOut />}
        </div>
      </div>
    </Card>
  );
};

export const DOT: FC = () => {
  return (
    <CrossChainProvider>
      <_DOT />
    </CrossChainProvider>
  );
};
