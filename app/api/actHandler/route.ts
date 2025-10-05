import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json({
        success: true,
        message: 'Item marked as legitimate',
        data: body,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        action: 'keep',
        workflowType: 'KeepAction'
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
      estimatedCompletionTime: new Date(Date.now() + 10 * 60 * 1000).toISOString()
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
