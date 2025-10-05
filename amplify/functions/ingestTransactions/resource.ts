import { defineFunction, secret } from '@aws-amplify/backend';

// Define secrets for sensitive data (recommended approach)
const plaidClientId = secret('PLAID_CLIENT_ID');
const plaidSandbox = secret('PLAID_SANDBOX');
const plaidWebhookSecret = secret('PLAID_WEBHOOK_SECRET');

export const ingestTransactions = defineFunction({
  name: 'ingestTransactions',
  entry: './index.ts',
  environment: {
    // Use process.env for non-sensitive configuration
    PLAID_ENVIRONMENT: process.env.PLAID_ENVIRONMENT || 'sandbox',
    // Reference secrets as environment variables (they'll be injected securely)
    PLAID_CLIENT_ID: plaidClientId,
    PLAID_SANDBOX: plaidSandbox,
    PLAID_WEBHOOK_SECRET: plaidWebhookSecret,
  },
  runtime: 18,
  timeoutSeconds: 300, // 5 minutes timeout for potential large sync operations
});