import { TimeLineItemProps } from './types';
/**
 * The `TimeLineItem`, must use inside `<TimeLine></TimeLine>` component
 *
 * @example
 *
 * ```jsx
 *    <TimeLineItem
 *      title='Proposed'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://tangle.tools'
 *    />
 *
 *    <TimeLineItem
 *      title='Signed'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://tangle.tools'
 *      extraContent={
 *        <div className='flex items-center space-x-2'>
 *          <KeyValueWithButton keyValue={randEthereumAddress()} size='sm' />
 *          <Button variant='link' size='sm' className='uppercase'>
 *            Detail
 *          </Button>
 *        </div>
 *       }
 *     />
 *
 *    <TimeLineItem
 *      title='Key Rotated'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://tangle.tools'
 *      extraContent={
 *        <div className='flex items-center space-x-4'>
 *          <LabelWithValue label='Height' value={1000654} />
 *          <LabelWithValue label='Proposal' value='KeyRotation' />
 *          <LabelWithValue
 *            label='Proposers'
 *            value={
 *              <AvatarGroup total={randNumber({ min: 10, max: 20 })}>
 *                {Object.values(keygen.authorities).map((au) => (
 *                   <Avatar key={au.id} src={au.avatarUrl} alt={au.id} />
 *                ))}
 *              </AvatarGroup>
 *            }
 *          />
 *          <Button size='sm' variant='link' className='uppercase'>
 *            Details
 *          </Button>
 *        </div>
 *      }
 *    />
 * ```
 */
export declare const TimeLineItem: import('../../../../../node_modules/react').ForwardRefExoticComponent<TimeLineItemProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
