import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * cancelEmail Lambda Function
 * Simulates email-based subscription cancellation
 * This is a fallback when cancelApi fails
 */

interface CancelEmailEvent {
  detectionItemId: string;
  userId: string;
  metadata: {
    merchant: string;
    amount: number;
    date: string;
    accountLast4: string;
  };
}

interface CancelEmailResponse {
  success: boolean;
  method: string;
  merchant: string;
  detectionItemId: string;
  emailId?: string;
  draftId?: string;
  error?: string;
  message?: string;
  emailDetails?: {
    to: string;
    subject: string;
    body: string;
    from: string;
  };
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<CancelEmailResponse> => {
  console.log('cancelEmail received event:', JSON.stringify(event, null, 2));

  try {
    const payload = event as unknown as CancelEmailEvent;
    const { detectionItemId, userId, metadata } = payload;

    // Validate input
    if (!detectionItemId || !userId || !metadata?.merchant) {
      throw new Error('Missing required fields: detectionItemId, userId, or metadata.merchant');
    }

        console.log(`Attempting email cancellation for ${metadata.merchant} - ${detectionItemId}`);

        // Generate email content first
        const emailContent = generateEmailContent(metadata.merchant, metadata, detectionItemId);
        
        // Log email details for debugging
        console.log(`📧 Email Details:`);
        console.log(`   To: ${emailContent.to}`);
        console.log(`   From: ${emailContent.from}`);
        console.log(`   Subject: ${emailContent.subject}`);
        console.log(`   Body Preview: ${emailContent.body.substring(0, 200)}...`);

        // Simulate email sending process
        const emailResult = await simulateEmailSending(metadata.merchant, detectionItemId, metadata);

        if (emailResult.success) {
          console.log(`✅ Successful email cancellation for ${metadata.merchant}`);
          
          return {
            success: true,
            method: 'email',
            merchant: metadata.merchant,
            detectionItemId,
            emailId: emailResult.emailId,
            draftId: emailResult.draftId,
            message: `Successfully sent cancellation email for ${metadata.merchant} subscription`,
            emailDetails: {
              to: emailContent.to,
              from: emailContent.from,
              subject: emailContent.subject,
              body: emailContent.body
            }
          };
        } else {
          console.log(`❌ Email cancellation failed for ${metadata.merchant}`);
          
          return {
            success: false,
            method: 'email',
            merchant: metadata.merchant,
            detectionItemId,
            error: emailResult.error || 'Email sending failed',
            message: `Email cancellation failed for ${metadata.merchant}. Will try voice call fallback.`,
            emailDetails: {
              to: emailContent.to,
              from: emailContent.from,
              subject: emailContent.subject,
              body: emailContent.body
            }
          };
        }

  } catch (error) {
    console.error('Error in cancelEmail:', error);
    
    return {
      success: false,
      method: 'email',
      merchant: 'unknown',
      detectionItemId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Email cancellation failed due to error. Will try voice call fallback.'
    };
  }
};

/**
 * Simulate email sending process
 * In real implementation, this would use Gmail API or similar
 */
async function simulateEmailSending(
  merchant: string, 
  detectionItemId: string, 
  metadata: any
): Promise<{ success: boolean; emailId?: string; draftId?: string; error?: string }> {
  
  // Simulate email processing time (draft creation + sending)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));

  // Merchant-specific email success rates
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

  const successRate = merchantEmailSuccessRates[merchant] || merchantEmailSuccessRates['Unknown'];
  const success = Math.random() < successRate;

  console.log(`Simulated email to ${merchant}: ${success ? 'SUCCESS' : 'FAILED'} (${(successRate * 100).toFixed(1)}% success rate)`);

  if (success) {
    // Generate mock email and draft IDs
    const emailId = `EMAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const draftId = `DRAFT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate email content creation
    const emailContent = generateEmailContent(merchant, metadata);
    console.log(`📧 Email content generated for ${merchant}:`, emailContent.subject);
    
    console.log(`✅ Email sent successfully to ${merchant} support team`);
    console.log(`📧 Email ID: ${emailId}`);
    console.log(`📝 Draft ID: ${draftId}`);
    
    return { 
      success: true, 
      emailId, 
      draftId 
    };
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
    
    console.log(`❌ Email failed for ${merchant}: ${randomError}`);
    
    return { 
      success: false, 
      error: randomError 
    };
  }
}

/**
 * Generate email content based on merchant
 */
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
