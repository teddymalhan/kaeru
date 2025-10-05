import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, TransactionsGetRequest } from 'plaid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
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

    // Set default date range if not provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30); // Last 30 days

    const defaultEndDate = new Date();

    const transactionsRequest: TransactionsGetRequest = {
      access_token: accessToken,
      start_date: startDate || defaultStartDate.toISOString().split('T')[0],
      end_date: endDate || defaultEndDate.toISOString().split('T')[0],
      options: {
        include_personal_finance_category: true,
        count: 500, // Maximum number of transactions to return
      },
    };

    console.log(`Fetching transactions for access token: ${accessToken.substring(0, 10)}...`);

    const response = await client.transactionsGet(transactionsRequest);
    
    return NextResponse.json({
      transactions: response.data.transactions,
      total_transactions: response.data.total_transactions,
      accounts: response.data.accounts,
      item: response.data.item,
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    
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
