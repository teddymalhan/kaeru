import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, ItemPublicTokenExchangeRequest } from 'plaid';

export async function POST(request: NextRequest) {
  try {
    const { public_token, userId } = await request.json();

    if (!public_token || !userId) {
      return NextResponse.json(
        { error: 'Public token and user ID are required' },
        { status: 400 }
      );
    }

    // Get Plaid credentials from environment variables
    const clientId = process.env.PLAID_CLIENT_ID || "68e1919bb29c1000263002ec";
    const secret = process.env.PLAID_SECRET || process.env.PLAID_SANDBOX_SECRET || process.env.PLAID_SANDBOX || "2426d9179d31bc7213942680e161ef";
    const environment = process.env.PLAID_ENVIRONMENT || 'sandbox';

    if (!clientId || !secret) {
      console.error('Plaid credentials not configured');
      return NextResponse.json(
        { error: 'Plaid credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: environment === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
          'Plaid-Version': '2020-09-14',
        },
      },
    });

    const client = new PlaidApi(configuration);

    // Exchange public token for access token
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: public_token,
    };

    console.log(`Exchanging public token for user: ${userId}`);

    const response = await client.itemPublicTokenExchange(exchangeRequest);
    
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // TODO: Store access token and item ID in your database
    // This is critical for the webhook to work properly
    console.log(`Access token obtained for item: ${itemId}`);
    console.log(`Access token: ${accessToken.substring(0, 10)}...`);

    // TODO: Implement database storage
    // await storeAccessToken(userId, itemId, accessToken);

    return NextResponse.json({
      access_token: accessToken,
      item_id: itemId,
      message: 'Token exchanged successfully. Remember to store the access token in your database.',
    });

  } catch (error: any) {
    console.error('Error exchanging token:', error);
    
    if (error.response?.data) {
      const plaidError = error.response.data;
      console.error('Plaid API Error:', plaidError);
      
      return NextResponse.json(
        {
          error: 'Plaid API error',
          details: plaidError,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}