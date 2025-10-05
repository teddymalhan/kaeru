// Example: Creating Link Token with Webhook
// This should be implemented in your backend API that creates Link tokens

import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, Products, CountryCode } from 'plaid';

const createLinkTokenWithWebhook = async (userId: string) => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox, // or production
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });

  const client = new PlaidApi(configuration);

  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: userId,
    },
    client_name: 'Cancel My Stuff',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
    // 🚨 CRITICAL: Include your webhook URL here
    webhook: 'https://qxqc52wktm74c2fod3trdrhzaq0ztpym.lambda-url.us-east-1.on.aws/',
  };

  try {
    const response = await client.linkTokenCreate(request);
    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

export default createLinkTokenWithWebhook;