import React, { FC, useCallback, useMemo } from 'react';
import { Form } from 'antd';

import { BalanceInput, TxButton, numToFixed18Inner, UserAssetBalance } from '@webb-dapp/react-components';
import { useConstants, useAccounts } from '@webb-dapp/react-hooks';
import { Card, Select } from '@webb-dapp/ui-components';

import { ReactComponent as LaminarLogo } from '../../assets/laminar-logo.svg';
import classes from './AUSD.module.scss';
import { AddressToInput } from './AddressInput';

const FormItem = Form.Item;

const parachainIdsMap = new Map<string, number>([
  ['laminar', 5001],
  ['acala', 500]
]);

export const AUSD: FC = () => {
  const { active } = useAccounts();
  const { stableCurrency } = useConstants();
  const [form] = Form.useForm();

  const formLayout = useMemo(() => {
    return {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    };
  }, []);

  const getParams = useCallback((): any[] => {
    const values = form.getFieldsValue();

    return [stableCurrency, parachainIdsMap.get(values.network), values.address, numToFixed18Inner(values.amount)];
  }, [form, stableCurrency]);

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
    <Card>
      <div className={classes.root}>
        <div className={classes.container}>
          <Form {...formLayout} form={form}>
            <FormItem initialValue='laminar' label='Transfer aUSD from Acala to Laminar' name='network'>
              <Select>
                <Select.Option value={'laminar'}>
                  <LaminarLogo />
                  <p>Laminar</p>
                </Select.Option>
              </Select>
            </FormItem>
            <FormItem label='Account' name='address'>
              <AddressToInput from={active?.address} />
            </FormItem>
            <FormItem
              extra={
                <div className={classes.amountExtra}>
                  <p>Available</p>
                  <UserAssetBalance currency={stableCurrency} showCurrency />
                </div>
              }
              name='amount'
              rules={[
                {
                  message: 'Please Input Amount',
                  required: true
                }
              ]}
            >
              <BalanceInput value={{ amount: 0, token: stableCurrency }} />
            </FormItem>
            <TxButton
              className={classes.txBtn}
              method='transferToParachain'
              onInblock={handleSuccess}
              params={getParams}
              preCheck={preCheck}
              section='xTokens'
            >
              Transfer
            </TxButton>
          </Form>
        </div>
      </div>
    </Card>
  );
};
