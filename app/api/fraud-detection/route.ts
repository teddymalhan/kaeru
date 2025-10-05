import { NextRequest, NextResponse } from 'next/server';
import { FraudDetectionAgent } from '@/lib/fraud-detection-agent';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import type { Schema } from '@/amplify/data/resource';
import outputs from '../../../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

const client = generateClient<Schema>();

// Initialize the fraud detection agent
const fraudAgent = new FraudDetectionAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transactionId, userId, batchTransactions, amount, description, merchant, category, date } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: action' 
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'analyze_transaction':
        if (!transactionId) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Missing required field: transactionId for analyze_transaction action' 
            },
            { status: 400 }
          );
        }

        // Get transaction data from database
        const transaction = await client.models.Transaction.get({ id: transactionId });
        
        if (!transaction.data) {
          // Use provided transaction data or create a mock transaction analysis
          result = await fraudAgent.analyzeTransaction({
            transactionId: transactionId,
            amount: amount || 100.00,
            date: date || new Date().toISOString().split('T')[0],
            description: description || 'Test transaction for fraud analysis',
            merchant: merchant || 'Test Merchant',
            category: category || 'Test Category',
            userId: userId || 'test-user'
          });
        } else {
          // Analyze the real transaction
          result = await fraudAgent.analyzeTransaction({
            transactionId: transaction.data.id,
            amount: transaction.data.amount,
            date: transaction.data.date,
            description: transaction.data.description,
            merchant: transaction.data.merchant || undefined,
            category: transaction.data.category || undefined,
            userId: userId || 'unknown-user'
          });
        }

        // Check if DetectionItem already exists for this transaction
        const detectionItems = await client.models.DetectionItem.list({
          filter: { transactionId: { eq: transactionId } }
        });

        if (detectionItems.data.length > 0) {
          // Update existing DetectionItem with fraud analysis results
          const detectionItem = detectionItems.data[0];
          
          await client.models.DetectionItem.update({
            id: detectionItem.id,
            notes: `Fraud Analysis: ${result.output.riskLevel} risk. Risk score: ${result.output.reasoning.split('Risk score: ')[1]?.split('/')[0] || 'unknown'}/100. Indicators: ${result.output.fraudIndicators.join(', ')}`,
            status: result.output.recommendedAction === 'BLOCK' || result.output.recommendedAction === 'INVESTIGATE' ? 'HIGH_RISK' : 'DETECTED',
            confidence: result.output.confidenceScore,
          });
        } else {
          // Create new DetectionItem for high-risk or medium-risk transactions
          if (result.output.riskLevel === 'HIGH' || result.output.riskLevel === 'MEDIUM') {
            const transactionData = transaction?.data || {
              amount: amount || 100.00,
              description: description || 'Test transaction for fraud analysis',
              merchant: merchant || 'Test Merchant'
            };

            // First, create a Transaction record if it doesn't exist
            let actualTransactionId = transactionId;
            if (!transaction?.data) {
              console.log('Creating new transaction for fraud analysis...');
              try {
                const newTransaction = await client.models.Transaction.create({
                  amount: amount || 100.00,
                  date: date || new Date().toISOString().split('T')[0],
                  description: description || 'Test transaction for fraud analysis',
                  merchant: merchant || 'Test Merchant',
                  category: category || 'Test Category'
                });
                if (newTransaction.data) {
                  actualTransactionId = newTransaction.data.id;
                  console.log('Created transaction with ID:', actualTransactionId);
                } else {
                  console.log('Transaction created but data is null');
                }
              } catch (error) {
                console.error('Error creating transaction:', error);
              }
            }

            console.log('Creating DetectionItem for high-risk transaction...');
            try {
              const detectionItem = await client.models.DetectionItem.create({
                itemName: transactionData.description,
                subscriptionType: 'ONE_TIME',
                status: result.output.riskLevel === 'HIGH' ? 'HIGH_RISK' : 'DETECTED',
                detectedAmount: Math.abs(transactionData.amount),
                confidence: result.output.confidenceScore,
                transactionId: actualTransactionId,
                notes: `Fraud Analysis: ${result.output.riskLevel} risk. Risk score: ${result.output.reasoning.split('Risk score: ')[1]?.split('/')[0] || 'unknown'}/100. Indicators: ${result.output.fraudIndicators.join(', ')}`
              });
              console.log('Created DetectionItem:', detectionItem);
              if (detectionItem.data) {
                console.log('DetectionItem ID:', detectionItem.data.id);
              } else {
                console.log('DetectionItem created but data is null');
              }
            } catch (error) {
              console.error('Error creating DetectionItem:', error);
            }
          }
        }

        break;

      case 'analyze_user_behavior':
        if (!userId) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Missing required field: userId for analyze_user_behavior action' 
            },
            { status: 400 }
          );
        }

        const days = body.days || 30;
        result = await fraudAgent.analyzeUserBehavior(userId, days);
        break;

      case 'batch_analyze':
        if (!batchTransactions || !Array.isArray(batchTransactions)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Missing or invalid batchTransactions array for batch_analyze action' 
            },
            { status: 400 }
          );
        }

        result = await fraudAgent.batchAnalyzeTransactions(batchTransactions);
        break;

      case 'get_fraud_summary':
        // Get all transactions with fraud analysis
        const allTransactions = await client.models.Transaction.list();
        const allDetectionItems = await client.models.DetectionItem.list();

        const fraudSummary = {
          totalTransactions: allTransactions.data.length,
          totalDetectionItems: allDetectionItems.data.length,
          highRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('HIGH risk') || item.notes?.includes('BLOCK')
          ).length,
          mediumRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('MEDIUM risk') || item.notes?.includes('REVIEW')
          ).length,
          lowRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('LOW risk') || item.notes?.includes('APPROVE')
          ).length,
          lastAnalyzed: new Date().toISOString()
        };

        result = fraudSummary;
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid action: ${action}. Supported actions: analyze_transaction, analyze_user_behavior, batch_analyze, get_fraud_summary` 
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
      metadata: {
        transactionId: transactionId || null,
        userId: userId || null,
        batchSize: batchTransactions?.length || null
      }
    });

  } catch (error) {
    console.error('Fraud detection API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_fraud_summary';

    let result;

    switch (action) {
      case 'get_fraud_summary':
        // Get fraud detection summary
        const summaryTransactions = await client.models.Transaction.list();
        const allDetectionItems = await client.models.DetectionItem.list();

        const fraudSummary = {
          totalTransactions: summaryTransactions.data.length,
          totalDetectionItems: allDetectionItems.data.length,
          highRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('HIGH risk') || item.notes?.includes('BLOCK')
          ).length,
          mediumRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('MEDIUM risk') || item.notes?.includes('REVIEW')
          ).length,
          lowRiskItems: allDetectionItems.data.filter(item => 
            item.notes?.includes('LOW risk') || item.notes?.includes('APPROVE')
          ).length,
          recentHighRiskItems: allDetectionItems.data
            .filter(item => item.notes?.includes('HIGH risk'))
            .slice(0, 5)
            .map(item => ({
              id: item.id,
              itemName: item.itemName,
              status: item.status,
              detectedAmount: item.detectedAmount,
              notes: item.notes
            })),
          lastAnalyzed: new Date().toISOString()
        };

        result = fraudSummary;
        break;

      case 'get_high_risk_transactions':
        // Get high-risk transactions
        const highRiskItems = await client.models.DetectionItem.list({
          filter: {
            or: [
              { notes: { contains: 'HIGH risk' } },
              { notes: { contains: 'BLOCK' } },
              { notes: { contains: 'Risk score: 5' } }
            ]
          }
        });

        result = highRiskItems.data.map(item => ({
          id: item.id,
          itemName: item.itemName,
          status: item.status,
          detectedAmount: item.detectedAmount,
          confidence: item.confidence,
          notes: item.notes,
          transactionId: item.transactionId
        }));
        break;

      case 'analyze_all_transactions':
        // Analyze all transactions and create DetectionItems for high-risk ones
        const transactionsToAnalyze = await client.models.Transaction.list();
        const analysisResults = [];

        for (const transaction of transactionsToAnalyze.data) {
          try {
            const analysis = await fraudAgent.analyzeTransaction({
              transactionId: transaction.id,
              amount: transaction.amount,
              date: transaction.date,
              description: transaction.description,
              merchant: transaction.merchant || undefined,
              category: transaction.category || undefined,
              userId: 'system'
            });

            if (analysis.output.riskLevel === 'HIGH' || analysis.output.riskLevel === 'MEDIUM') {
              // Check if DetectionItem already exists
              const existingItems = await client.models.DetectionItem.list({
                filter: { transactionId: { eq: transaction.id } }
              });

              if (existingItems.data.length === 0) {
                // Create new DetectionItem for high-risk transaction
                await client.models.DetectionItem.create({
                  itemName: transaction.description,
                  subscriptionType: 'ONE_TIME',
                  status: 'DETECTED',
                  detectedAmount: Math.abs(transaction.amount),
                  confidence: analysis.output.confidenceScore,
                  transactionId: transaction.id,
                  notes: `Fraud Analysis: ${analysis.output.riskLevel} risk. Risk score: ${analysis.output.reasoning.split('Risk score: ')[1]?.split('/')[0] || 'unknown'}/100. Indicators: ${analysis.output.fraudIndicators.join(', ')}`
                });
              }
            }

            analysisResults.push({
              transactionId: transaction.id,
              analysis: analysis.output,
              timestamp: analysis.timestamp
            });
          } catch (error) {
            console.error(`Error analyzing transaction ${transaction.id}:`, error);
          }
        }

        result = {
          totalAnalyzed: transactionsToAnalyze.data.length,
          highRiskFound: analysisResults.filter(r => r.analysis.riskLevel === 'HIGH').length,
          mediumRiskFound: analysisResults.filter(r => r.analysis.riskLevel === 'MEDIUM').length,
          lowRiskFound: analysisResults.filter(r => r.analysis.riskLevel === 'LOW').length,
          results: analysisResults
        };
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid action: ${action}. Supported actions: get_fraud_summary, get_high_risk_transactions, analyze_transaction, analyze_user_behavior, analyze_all_transactions` 
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fraud detection GET API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
