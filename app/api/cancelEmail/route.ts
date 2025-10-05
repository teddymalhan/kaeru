import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.detectionItemId || !body.userId || !body.metadata?.merchant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: detectionItemId, userId, or metadata.merchant' 
        },
        { status: 400 }
      );
    }
    
    // Simulate different success rates based on merchant for email
    const merchantEmailSuccessRates: Record<string, number> = {
      'Netflix': 0.85,       // 85% success rate
      'Spotify': 0.80,       // 80% success rate
      'Amazon Prime': 0.75,  // 75% success rate
      'Disney+': 0.82,       // 82% success rate
      'Hulu': 0.78,          // 78% success rate
      'Adobe': 0.70,         // 70% success rate (complex cancellation)
      'Microsoft': 0.72,     // 72% success rate
      'Apple': 0.85,         // 85% success rate
      'Google': 0.88,        // 88% success rate
      'Unknown': 0.60        // 60% success rate for unknown merchants
    };
    
    const successRate = merchantEmailSuccessRates[body.metadata.merchant] || merchantEmailSuccessRates['Unknown'];
    const success = Math.random() < successRate;
    
    if (success) {
      // Generate mock email and draft IDs
      const emailId = `EMAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const draftId = `DRAFT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate email content
      const emailContent = generateEmailContent(body.metadata.merchant, body.metadata, body.detectionItemId);
      
      return NextResponse.json({
        success: true,
        message: `Successfully sent cancellation email for ${body.metadata.merchant} subscription`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'email',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        emailId,
        draftId,
        emailDetails: {
          to: emailContent.to,
          from: emailContent.from,
          subject: emailContent.subject,
          body: emailContent.body
        }
      });
    } else {
      // Simulate different failure scenarios
      const failureReasons = [
        'Invalid email address',
        'Email quota exceeded',
        'Network timeout',
        'SMTP server error',
        'Recipient inbox full'
      ];
      
      const randomError = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      
      // Generate email content even for failed emails
      const emailContent = generateEmailContent(body.metadata.merchant, body.metadata, body.detectionItemId);
      
      return NextResponse.json({
        success: false,
        message: `Email cancellation failed for ${body.metadata.merchant}. Will try voice call fallback.`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'email',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        error: randomError,
        emailDetails: {
          to: emailContent.to,
          from: emailContent.from,
          subject: emailContent.subject,
          body: emailContent.body
        }
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// Generate email content based on merchant
function generateEmailContent(merchant: string, metadata: any, detectionItemId: string) {
  // Generate realistic email addresses
  const merchantEmails: Record<string, string> = {
    'Netflix': 'support@netflix.com',
    'Spotify': 'support@spotify.com',
    'Amazon Prime': 'support@amazon.com',
    'Disney+': 'support@disneyplus.com',
    'Hulu': 'support@hulu.com',
    'Adobe': 'support@adobe.com',
    'Microsoft': 'support@microsoft.com',
    'Apple': 'support@apple.com',
    'Google': 'support@google.com',
    'Unknown': 'support@unknown-merchant.com'
  };

  const fromEmail = 'customer@cancelmystuff.com';
  const toEmail = merchantEmails[merchant] || merchantEmails['Unknown'];

  const templates: Record<string, any> = {
    'Netflix': {
      subject: 'Subscription Cancellation Request',
      body: `Dear Netflix Support Team,

I would like to cancel my Netflix subscription.

Account Details:
- Subscription ID: ${detectionItemId}
- Amount: $${metadata.amount}
- Date: ${metadata.date}
- Account ending in: ****${metadata.accountLast4}

Please confirm the cancellation and let me know the effective date.

Thank you for your service.

Best regards,
Customer`
    },
    'Spotify': {
      subject: 'Premium Subscription Cancellation',
      body: `Dear Spotify Support,

Please cancel my Spotify Premium subscription.

Account Information:
- Subscription ID: ${detectionItemId}
- Amount: $${metadata.amount}
- Date: ${metadata.date}
- Account: ****${metadata.accountLast4}

I would appreciate confirmation of the cancellation.

Best regards,
Customer`
    },
    'Adobe': {
      subject: 'Adobe Creative Cloud Subscription Cancellation',
      body: `Dear Adobe Support Team,

I request the cancellation of my Adobe Creative Cloud subscription.

Subscription Details:
- Subscription ID: ${detectionItemId}
- Amount: $${metadata.amount}
- Date: ${metadata.date}
- Account: ****${metadata.accountLast4}

Please process the cancellation and provide confirmation.

Thank you,
Customer`
    }
  };

  const template = templates[merchant] || {
    subject: `Subscription Cancellation Request - ${merchant}`,
    body: `Dear ${merchant} Support Team,

I would like to cancel my subscription.

Details:
- Subscription ID: ${detectionItemId}
- Amount: $${metadata.amount}
- Date: ${metadata.date}
- Account: ****${metadata.accountLast4}

Please confirm the cancellation.

Thank you,
Customer`
  };

  return {
    to: toEmail,
    from: fromEmail,
    subject: template.subject,
    body: template.body
  };
}
