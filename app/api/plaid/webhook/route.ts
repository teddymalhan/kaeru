import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();
    
    console.log('Received Plaid webhook:', JSON.stringify(webhook, null, 2));

    // Validate webhook format
    if (!webhook.webhook_type || !webhook.webhook_code || !webhook.item_id) {
      console.error('Invalid webhook format');
      return NextResponse.json(
        { error: 'Invalid webhook format' },
        { status: 400 }
      );
    }

    // Handle different webhook types
    switch (webhook.webhook_code) {
      case 'SYNC_UPDATES_AVAILABLE':
        console.log(`SYNC_UPDATES_AVAILABLE webhook for item: ${webhook.item_id}`);
        console.log(`Initial update complete: ${webhook.initial_update_complete}`);
        console.log(`Historical update complete: ${webhook.historical_update_complete}`);
        
        // TODO: Trigger the ingestTransactions Lambda function
        // This is a local webhook handler for testing
        // In production, Plaid should call the Lambda function directly
        
        break;

      case 'INITIAL_UPDATE':
        console.log('INITIAL_UPDATE webhook received - 30 days of data available');
        break;

      case 'HISTORICAL_UPDATE':
        console.log('HISTORICAL_UPDATE webhook received - full history available');
        break;

      case 'DEFAULT_UPDATE':
        console.log('DEFAULT_UPDATE webhook received - new transactions available');
        break;

      case 'TRANSACTIONS_REMOVED':
        console.log('TRANSACTIONS_REMOVED webhook received');
        break;

      default:
        console.log(`Unhandled webhook code: ${webhook.webhook_code}`);
    }

    return NextResponse.json({
      message: 'Webhook received successfully',
      webhook_type: webhook.webhook_type,
      webhook_code: webhook.webhook_code,
      item_id: webhook.item_id,
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
