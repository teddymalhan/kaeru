import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, Products, CountryCode } from 'plaid';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get Plaid credentials from environment variables
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SANDBOX; // or PLAID_SECRET for production
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

    // Get webhook URL from Amplify outputs
    const webhookUrl = process.env.INGEST_TRANSACTIONS_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Webhook URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    // Create Link token request
    const linkTokenRequest: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Cancel My Stuff',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      // Include webhook URL for transaction updates
      webhook: webhookUrl,
      transactions: {
        days_requested: 90, // Get 90 days of historical data
      },
    };

    console.log(`Creating Link token for user: ${userId}`);
    console.log(`Using webhook URL: ${webhookUrl}`);

    const response = await client.linkTokenCreate(linkTokenRequest);
    
    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });

  } catch (error: any) {
    console.error('Error creating Link token:', error);
    
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