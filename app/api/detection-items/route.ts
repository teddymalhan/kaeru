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
    if (!body.itemName || !body.subscriptionType || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: itemName, subscriptionType, status' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Creating DetectionItem: ${body.itemName}`);
    
    // Create the DetectionItem
    const { data: detectionItem, errors } = await client.models.DetectionItem.create({
      itemName: body.itemName,
      subscriptionType: body.subscriptionType,
      status: body.status,
      detectedAmount: body.detectedAmount,
      confidence: body.confidence,
      notes: body.notes,
      transactionId: body.transactionId || "dispute-transaction", // Default for disputes
    });
    
    if (errors || !detectionItem) {
      console.error(`❌ Failed to create DetectionItem:`, errors);
      return NextResponse.json(
        { error: 'Failed to create DetectionItem', details: errors },
        { status: 500 }
      );
    }
    
    console.log(`✅ Created DetectionItem: ${detectionItem.id}`);
    
    return NextResponse.json({
      success: true,
      id: detectionItem.id,
      detectionItem: {
        id: detectionItem.id,
        itemName: detectionItem.itemName,
        subscriptionType: detectionItem.subscriptionType,
        status: detectionItem.status,
        detectedAmount: detectionItem.detectedAmount,
        confidence: detectionItem.confidence,
        notes: detectionItem.notes,
        createdAt: detectionItem.createdAt,
        updatedAt: detectionItem.updatedAt
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating DetectionItem:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create DetectionItem',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
