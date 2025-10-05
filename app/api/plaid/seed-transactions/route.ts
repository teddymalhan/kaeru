import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export async function POST(request: NextRequest) {
  try {
    const { count = 10, userId = 'seed-user' } = await request.json();

    console.log(`Seeding ${count} transactions for user: ${userId}`);

    // Sample transaction data
    const sampleTransactions = [
      {
        amount: -9.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Netflix Monthly Subscription',
        merchant: 'Netflix',
        category: 'Entertainment'
      },
      {
        amount: -14.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Spotify Premium',
        merchant: 'Spotify',
        category: 'Entertainment'
      },
      {
        amount: -5.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Apple iCloud Storage',
        merchant: 'Apple',
        category: 'Technology'
      },
      {
        amount: -12.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Adobe Creative Cloud',
        merchant: 'Adobe',
        category: 'Software'
      },
      {
        amount: -29.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Gym Membership',
        merchant: 'Planet Fitness',
        category: 'Health & Fitness'
      },
      {
        amount: -8.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Amazon Prime',
        merchant: 'Amazon',
        category: 'Shopping'
      },
      {
        amount: -19.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Microsoft 365',
        merchant: 'Microsoft',
        category: 'Software'
      },
      {
        amount: -6.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Disney+',
        merchant: 'Disney',
        category: 'Entertainment'
      },
      {
        amount: -15.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Dropbox Plus',
        merchant: 'Dropbox',
        category: 'Technology'
      },
      {
        amount: -9.99,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Hulu',
        merchant: 'Hulu',
        category: 'Entertainment'
      }
    ];

    const createdTransactions = [];
    const createdDetectionItems = [];

    // Create transactions and detection items
    for (let i = 0; i < Math.min(count, sampleTransactions.length); i++) {
      const transactionData = sampleTransactions[i];
      
      try {
        // Create transaction
        const transaction = await client.models.Transaction.create({
          amount: transactionData.amount,
          date: transactionData.date,
          description: transactionData.description,
          merchant: transactionData.merchant,
          category: transactionData.category,
        });

        if (transaction.data) {
          createdTransactions.push(transaction.data);

          // Create detection item for subscription-like transactions
          if (transactionData.amount < 0 && Math.random() > 0.3) { // 70% chance of being a subscription
            const detectionItem = await client.models.DetectionItem.create({
              itemName: transactionData.merchant || transactionData.description,
              subscriptionType: Math.random() > 0.5 ? 'MONTHLY' : 'ANNUAL',
              status: 'DETECTED',
              detectedAmount: Math.abs(transactionData.amount),
              confidence: 0.8 + Math.random() * 0.2, // 80-100% confidence
              transactionId: transaction.data.id,
            });

            if (detectionItem.data) {
              createdDetectionItems.push(detectionItem.data);
            }
          }
        }
      } catch (error) {
        console.error(`Error creating transaction ${i}:`, error);
      }
    }

    // Simulate webhook call to the Lambda function
    const webhookUrl = process.env.INGEST_TRANSACTIONS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookPayload = {
          webhook_type: 'TRANSACTIONS',
          webhook_code: 'SYNC_UPDATES_AVAILABLE',
          item_id: 'seed-item-' + Date.now(),
          initial_update_complete: true,
          historical_update_complete: true,
          environment: 'sandbox'
        };

        console.log('Simulating webhook call to:', webhookUrl);
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        console.log('Webhook response status:', webhookResponse.status);
      } catch (error) {
        console.error('Error calling webhook:', error);
      }
    }

    return NextResponse.json({
      message: 'Seed data created successfully',
      transactions_created: createdTransactions.length,
      detection_items_created: createdDetectionItems.length,
      webhook_simulated: !!webhookUrl,
      data: {
        transactions: createdTransactions,
        detection_items: createdDetectionItems,
      }
    });

  } catch (error: any) {
    console.error('Error seeding data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to seed data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}