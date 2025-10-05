import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../../../amplify_outputs.json";

// Configure Amplify
Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.action || !body.detectionItemId || !body.userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: action, detectionItemId, userId' 
        },
        { status: 400 }
      );
    }
    
    // Handle different actions
    if (body.action === 'keep' || body.action === 'mark_legit') {
      // Update DetectionItem status to IGNORED
      try {
        await client.models.DetectionItem.update({
          id: body.detectionItemId,
          status: "IGNORED"
        });
        console.log(`📊 Updated DetectionItem ${body.detectionItemId} status to IGNORED`);
      } catch (updateError) {
        console.error(`❌ Failed to update DetectionItem status:`, updateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Item marked as legitimate',
        data: body,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        action: 'keep',
        workflowType: 'KeepAction',
        detectionItemStatus: 'IGNORED'
      });
    }
    
    if (body.action !== 'cancel' && body.action !== 'dispute') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid action: ${body.action}` 
        },
        { status: 400 }
      );
    }
    
    // Valid cancel/dispute actions
    const workflowType = body.action === 'cancel' ? 'CancelFlow' : 'DisputeFlow';
    
    // Simulate workflow processing with status updates
    const simulateWorkflow = async () => {
      // Update status to IN_PROGRESS
      try {
        await client.models.DetectionItem.update({
          id: body.detectionItemId,
          status: "IN_PROGRESS"
        });
        console.log(`📊 Updated DetectionItem ${body.detectionItemId} status to IN_PROGRESS`);
      } catch (updateError) {
        console.error(`❌ Failed to update DetectionItem status:`, updateError);
      }

      // Simulate processing time (2-5 seconds)
      const processingTime = Math.random() * 3000 + 2000;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate outcome (80% success rate for disputes)
      const successRate = body.action === 'dispute' ? 0.8 : 0.9;
      const isSuccessful = Math.random() < successRate;
      const finalStatus = isSuccessful ? "COMPLETED" : "FOLLOW_UP_REQUIRED";

      // Update final status
      try {
        await client.models.DetectionItem.update({
          id: body.detectionItemId,
          status: finalStatus
        });
        console.log(`📊 Updated DetectionItem ${body.detectionItemId} status to ${finalStatus}`);
      } catch (updateError) {
        console.error(`❌ Failed to update DetectionItem final status:`, updateError);
      }
    };

    // Start async workflow processing
    simulateWorkflow().catch(error => {
      console.error('Workflow simulation error:', error);
    });
    
    return NextResponse.json({
      success: true,
      message: 'actHandler called successfully',
      data: body,
      timestamp: new Date().toISOString(),
      executionArn: `arn:aws:states:us-east-1:123456789012:execution:${workflowType}:${Date.now()}`,
      status: 'STARTED',
      action: body.action,
      workflowType: workflowType,
      detectionItemId: body.detectionItemId,
      estimatedCompletionTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      detectionItemStatus: 'IN_PROGRESS'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
