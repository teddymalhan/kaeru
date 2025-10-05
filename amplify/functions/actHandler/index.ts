import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

const sfnClient = new SFNClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('actHandler received event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, detectionItemId, userId, metadata } = body;

    // Validate required fields
    if (!action || !detectionItemId || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: action, detectionItemId, userId'
        })
      };
    }

    // Determine workflow based on action
    let workflowType: string;
    let executionInput: any;

    switch (action) {
      case 'cancel':
        workflowType = 'CancelFlow';
        executionInput = {
          action: 'cancel',
          detectionItemId,
          userId,
          metadata: {
            merchant: metadata?.merchant || 'Unknown',
            amount: metadata?.amount || 0,
            date: metadata?.date || new Date().toISOString(),
            accountLast4: metadata?.accountLast4 || '****'
          }
        };
        break;

      case 'dispute':
        workflowType = 'DisputeFlow';
        executionInput = {
          action: 'dispute',
          detectionItemId,
          userId,
          metadata: {
            merchant: metadata?.merchant || 'Unknown',
            amount: metadata?.amount || 0,
            date: metadata?.date || new Date().toISOString(),
            accountLast4: metadata?.accountLast4 || '****',
            disputeReason: metadata?.disputeReason || 'fraud'
          }
        };
        break;

      case 'keep':
      case 'mark_legit':
        // For keep/mark_legit actions, just update status
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            action: 'keep',
            status: 'COMPLETED',
            message: 'Item marked as legitimate'
          })
        };

      default:
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: `Invalid action: ${action}`
          })
        };
    }

    // Generate unique execution name
    const executionName = `${workflowType}-${detectionItemId}-${Date.now()}`;
    
    // Get Step Functions state machine ARN from environment
    const stateMachineArn = process.env[`${workflowType.toUpperCase()}_STATE_MACHINE_ARN`];
    
    if (!stateMachineArn) {
      console.error(`State machine ARN not found for ${workflowType}`);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'State machine configuration error'
        })
      };
    }

    // Start Step Functions execution
    const startCommand = new StartExecutionCommand({
      stateMachineArn,
      name: executionName,
      input: JSON.stringify(executionInput)
    });

    let executionResult;
    try {
      executionResult = await sfnClient.send(startCommand);
      console.log(`Started ${workflowType} execution:`, executionResult.executionArn);
    } catch (error) {
      console.error('Failed to start Step Functions execution:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Failed to start workflow execution'
        })
      };
    }

    // Update DetectionItem status to indicate processing started
    try {
      // Note: This would require proper Amplify data client setup in Lambda
      // For now, we'll log the status update that should happen
      console.log(`Should update DetectionItem ${detectionItemId} status to PROCESSING`);
      // TODO: Implement actual data update once Step Functions are defined
    } catch (error) {
      console.error('Failed to update DetectionItem status:', error);
      // Don't fail the request, just log the error
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        executionArn: executionResult.executionArn,
        executionName,
        status: 'STARTED',
        action,
        workflowType,
        detectionItemId,
        estimatedCompletionTime: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      })
    };

  } catch (error) {
    console.error('Error in actHandler:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
