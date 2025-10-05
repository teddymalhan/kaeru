import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { ingestTransactions } from './functions/ingestTransactions/resource.js';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  auth,
  data,
  ingestTransactions,
});

// Add function URL for webhook endpoint using CDK
const functionUrl = backend.ingestTransactions.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // No authentication for webhooks
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ['*'],
  },
});

// Output the webhook URL for easy access
backend.addOutput({
  custom: {
    ingestTransactionsWebhookUrl: functionUrl.url,
  }
});
