/**
 * Transaction names used in tangle-cloud for notifications.
 * These are displayed to users in processing/success/error notifications.
 */
export enum TxName {
  REGISTER_BLUEPRINT = 'register blueprint',
  UNREGISTER_BLUEPRINT = 'unregister blueprint',
  REJECT_SERVICE_REQUEST = 'reject service request',
  APPROVE_SERVICE_REQUEST = 'approve service request',
  DEPLOY_BLUEPRINT = 'deploy blueprint',
  TERMINATE_SERVICE_INSTANCE = 'terminate service instance',
  CLAIM_EARNINGS = 'claim earnings',
}
