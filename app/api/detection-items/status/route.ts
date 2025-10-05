import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../../../../amplify_outputs.json";

// Configure Amplify
Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detectionItemId = searchParams.get('id');
    const lastUpdated = searchParams.get('lastUpdated');
    
    if (!detectionItemId) {
      return NextResponse.json(
        { error: 'Missing detectionItemId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Polling status for DetectionItem ${detectionItemId} (since: ${lastUpdated || 'initial'})`);
    
    // Fetch the current DetectionItem
    const { data: detectionItem, errors } = await client.models.DetectionItem.get({
      id: detectionItemId
    });
    
    if (errors || !detectionItem) {
      console.error(`❌ Failed to fetch DetectionItem ${detectionItemId}:`, errors);
      return NextResponse.json(
        { error: 'DetectionItem not found' },
        { status: 404 }
      );
    }
    
    // Check if there's been an update since last poll
    const currentUpdatedAt = detectionItem.updatedAt;
    const hasUpdates = !lastUpdated || new Date(currentUpdatedAt) > new Date(lastUpdated);
    
    // Always return the latest timestamp for the next poll
    const nextPollTimestamp = currentUpdatedAt;
    
    return NextResponse.json({
      success: true,
      detectionItem: {
        id: detectionItem.id,
        status: detectionItem.status,
        itemName: detectionItem.itemName,
        subscriptionType: detectionItem.subscriptionType,
        detectedAmount: detectionItem.detectedAmount,
        confidence: detectionItem.confidence,
        cancellationDate: detectionItem.cancellationDate,
        notes: detectionItem.notes,
        updatedAt: detectionItem.updatedAt,
        createdAt: detectionItem.createdAt
      },
      hasUpdates,
      timestamp: new Date().toISOString(),
      nextPollTimestamp: nextPollTimestamp
    });
    
  } catch (error) {
    console.error('Error polling DetectionItem status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to poll DetectionItem status',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
