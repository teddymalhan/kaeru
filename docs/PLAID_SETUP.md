# Plaid Environment Variables & Webhook Setup Guide

## Overview

This guide explains how to configure environment variables and set up the webhook URL for the Plaid ingestTransactions Lambda function using AWS Amplify Gen2.

## Environment Variables Configuration

### 1. Amplify Gen2 Environment Variables Approach

Amplify Gen2 uses a modern approach with two types of configuration:

#### **Environment Variables (Non-sensitive)**

- Stored in plaintext
- Visible in CloudFormation templates
- Use for non-sensitive configuration like environment names

#### **Secrets (Sensitive)**

- Stored securely using AWS Secrets Manager
- Encrypted at rest and in transit
- Use for API keys, passwords, tokens

### 2. Current Configuration

The `ingestTransactions` function is configured with:

```typescript
// amplify/functions/ingestTransactions/resource.ts
export const ingestTransactions = defineFunction({
  environment: {
    PLAID_ENVIRONMENT: process.env.PLAID_ENVIRONMENT || "sandbox",
    PLAID_CLIENT_ID: plaidClientId, // Secret reference
    PLAID_SECRET: plaidSecret, // Secret reference
    PLAID_WEBHOOK_SECRET: plaidWebhookSecret, // Secret reference
  },
});
```

### 3. Setting Up Secrets

#### **Step 1: Create Secrets in AWS Secrets Manager**

You can set secrets using the Amplify CLI or AWS Console:

```bash
# Using Amplify CLI (recommended)
npx ampx sandbox secret set PLAID_CLIENT_ID
# When prompted, enter your Plaid Client ID

npx ampx sandbox secret set PLAID_SECRET
# When prompted, enter your Plaid Secret Key

npx ampx sandbox secret set PLAID_WEBHOOK_SECRET
# When prompted, enter your Plaid Webhook Secret (optional for now)
```

#### **Step 2: Set Environment Variables**

For non-sensitive configuration, set environment variables in your deployment:

```bash
# For local development (.env file)
echo "PLAID_ENVIRONMENT=sandbox" >> .env

# For production deployment
# Set in your CI/CD pipeline or Amplify Console
export PLAID_ENVIRONMENT=production
```

### 4. Accessing Variables in Function Code

The function code uses the Amplify Gen2 environment import pattern:

```typescript
// In your Lambda function
import { env } from "$amplify/env/ingestTransactions";

export const handler = async (event) => {
  // Access environment variables and secrets
  const clientId = env.PLAID_CLIENT_ID; // Secret value
  const secret = env.PLAID_SECRET; // Secret value
  const environment = env.PLAID_ENVIRONMENT; // Environment variable

  // Use in Plaid client configuration
  const plaidClient = createPlaidClient();
};
```

## Webhook URL Setup

### 1. Getting the Webhook URL

After deploying your Amplify app, you'll get a Function URL:

```bash
# Deploy your app
npx ampx sandbox

# The output will include your webhook URL:
# ✅ Deployed resources:
# • Function URL: https://abcd1234.lambda-url.us-east-1.on.aws/
```

The webhook URL is also available in the Amplify outputs:

```javascript
// amplify_outputs.json (generated after deployment)
{
  "custom": {
    "ingestTransactionsWebhookUrl": "https://abcd1234.lambda-url.us-east-1.on.aws/"
  }
}
```

### 2. Configuring Plaid Webhook

#### **Step 1: Access Plaid Dashboard**

1. Go to [Plaid Dashboard](https://dashboard.plaid.com)
2. Navigate to **Team Settings** → **Webhooks**

#### **Step 2: Add Webhook Endpoint**

1. Click **"Add endpoint"**
2. Enter your Function URL: `https://your-function-url.lambda-url.region.on.aws/`
3. Select webhook types:
   - ✅ **SYNC_UPDATES_AVAILABLE** (primary)
   - ✅ **INITIAL_UPDATE** (optional)
   - ✅ **HISTORICAL_UPDATE** (optional)

#### **Step 3: Test Webhook**

Use Plaid's webhook testing tool to verify connectivity.

### 3. Webhook URL in Link Token Creation

When creating Link tokens, include your webhook URL:

```typescript
// In your frontend or backend Link token creation
const response = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: "Cancel My Stuff",
  products: ["transactions"],
  webhook: "https://your-function-url.lambda-url.region.on.aws/",
  country_codes: ["US"],
  language: "en",
  transactions: {
    days_requested: 90, // Optional: historical data
  },
});
```

## Development Workflow

### 1. Local Development

```bash
# 1. Set up environment
echo "PLAID_ENVIRONMENT=sandbox" >> .env

# 2. Set secrets (one time setup)
npx ampx sandbox secret set PLAID_CLIENT_ID
npx ampx sandbox secret set PLAID_SECRET
npx ampx sandbox secret set PLAID_WEBHOOK_SECRET

# 3. Start local development
npx ampx sandbox

# 4. Get webhook URL from output and configure in Plaid Dashboard
```

### 2. Production Deployment

```bash
# 1. Set production environment
export PLAID_ENVIRONMENT=production

# 2. Update secrets for production
npx ampx sandbox secret set PLAID_CLIENT_ID --env production
npx ampx sandbox secret set PLAID_SECRET --env production

# 3. Deploy to production
npx ampx pipeline-deploy --branch main

# 4. Update webhook URL in Plaid Dashboard for production
```

## Security Best Practices

### 1. Secret Management

- ✅ **DO**: Use Amplify secrets for API keys and tokens
- ❌ **DON'T**: Store sensitive data in environment variables
- ✅ **DO**: Rotate secrets regularly
- ✅ **DO**: Use different credentials for sandbox vs production

### 2. Webhook Security

- ✅ **DO**: Implement webhook signature validation (uncomment in code)
- ✅ **DO**: Use HTTPS URLs only
- ✅ **DO**: Monitor webhook failures
- ✅ **DO**: Set up CloudWatch alerts

### 3. Function Security

- ✅ **DO**: Use least privilege IAM policies
- ✅ **DO**: Enable CloudWatch logging
- ✅ **DO**: Set appropriate timeout values
- ✅ **DO**: Monitor function invocations

## Troubleshooting

### Common Issues

1. **"Secret not found" errors**

   ```bash
   # Check if secrets are set
   npx ampx sandbox secret list

   # Set missing secrets
   npx ampx sandbox secret set SECRET_NAME
   ```

2. **Webhook not receiving requests**

   - Verify Function URL is publicly accessible
   - Check Plaid Dashboard webhook configuration
   - Review CloudWatch logs for errors

3. **Function timeout errors**

   - Increase timeout in resource.ts
   - Optimize transaction processing logic
   - Consider pagination for large datasets

4. **CORS errors**
   - Verify CORS configuration in backend.ts
   - Ensure proper headers in webhook requests

### Monitoring & Debugging

```bash
# View function logs
npx ampx sandbox logs --function ingestTransactions

# Test webhook locally
curl -X POST https://your-function-url.lambda-url.region.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"webhook_type":"TRANSACTIONS","webhook_code":"SYNC_UPDATES_AVAILABLE","item_id":"test"}'
```

## Next Steps

1. **Deploy and Test**: Deploy your app and test the webhook
2. **Database Integration**: Implement the database storage methods
3. **Error Handling**: Set up proper error notifications
4. **Monitoring**: Configure CloudWatch alarms
5. **Scaling**: Optimize for production load

For more details, see the [complete README](./amplify/functions/ingestTransactions/README.md).
