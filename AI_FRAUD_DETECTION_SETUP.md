# 🛡️ AI Fraud Detection Setup Guide

This guide explains how to set up and use the AI-powered fraud detection system integrated with AWS Amplify Gen 2.

## ✅ What's Been Implemented

### 1. AWS Amplify AI Integration
- **AI Routes**: Added to `amplify/data/resource.ts` using `a.generation()` and `a.conversation()`
- **Custom Types**: Defined `FraudAnalysisResult` and `BehavioralAnalysisResult` for structured AI responses
- **AI Models**: Configured to use Claude 3.5 Haiku via AWS Bedrock

### 2. Fraud Detection Agent
- **Location**: `lib/fraud-detection-agent.ts`
- **Integration**: Uses Amplify AI routes instead of direct Bedrock calls
- **Features**: Transaction analysis, behavioral analysis, batch processing

### 3. API Endpoints
- **Location**: `app/api/fraud-detection/route.ts`
- **Actions**: `analyze_transaction`, `analyze_user_behavior`, `batch_analyze`, `get_fraud_summary`

### 4. UI Components
- **Location**: `app/components/FraudDetectionPanel.tsx`
- **Features**: Fraud dashboard, risk visualization, analysis controls
- **Integration**: Uses Amplify AI hooks (`useAIGeneration`, `useAIConversation`)

## 🚀 Getting Started

### Prerequisites
1. **AWS Account** with access to Bedrock Foundation Models
2. **Node.js** v18.16.0 or later
3. **npm** v6.14.4 or later
4. **Git** v2.14.1 or later

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy Backend with AI Capabilities**
   ```bash
   npx ampx sandbox
   ```

3. **Configure AWS Bedrock Access**
   - Ensure your AWS account has access to Claude 3.5 Haiku model
   - Verify IAM permissions for Bedrock access

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```bash
# AWS Configuration (auto-configured by Amplify)
AWS_REGION=us-east-1

# Optional: Custom fraud detection settings
FRAUD_DETECTION_ENABLED=true
FRAUD_RISK_THRESHOLD_HIGH=70
FRAUD_RISK_THRESHOLD_MEDIUM=50
FRAUD_RISK_THRESHOLD_LOW=30
```

### AI Model Configuration
The system is configured to use:
- **Primary Model**: Claude 3.5 Haiku (fast, cost-effective)
- **Backup Model**: Claude 3.5 Sonnet (more powerful, higher cost)

## 📊 AI Routes Available

### 1. Transaction Analysis
```typescript
// Analyze a single transaction
const result = await client.models.analyzeTransaction({
  transactionId: "tx_123",
  amount: -150.00,
  date: "2024-01-15T14:30:00Z",
  description: "Online Purchase",
  merchant: "Suspicious Store",
  category: "Shopping",
  userId: "user_456"
});
```

### 2. Behavioral Analysis
```typescript
// Analyze user behavior patterns
const result = await client.models.analyzeUserBehavior({
  userId: "user_456",
  days: 30
});
```

### 3. Interactive Chat
```typescript
// Use the fraud detection chat
const [{ messages, isLoading }, sendMessage] = useAIConversation('fraudDetectionChat');
```

## 🎯 Usage Examples

### Frontend Integration
```typescript
import { generateClient } from 'aws-amplify/data';
import { createAIHooks } from '@aws-amplify/ui-react-ai';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
const { useAIGeneration, useAIConversation } = createAIHooks(client);

// In your React component
function FraudDetectionComponent() {
  const [{ data: analysisResult }, analyzeTransaction] = useAIGeneration('analyzeTransaction');
  
  const handleAnalyze = async () => {
    await analyzeTransaction({
      transactionId: "tx_123",
      amount: -150.00,
      date: "2024-01-15T14:30:00Z",
      description: "Online Purchase",
      merchant: "Suspicious Store",
      category: "Shopping",
      userId: "user_456"
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze}>Analyze Transaction</button>
      {analysisResult && (
        <div>
          <p>Risk Level: {analysisResult.riskLevel}</p>
          <p>Confidence: {analysisResult.confidenceScore}%</p>
          <p>Action: {analysisResult.recommendedAction}</p>
        </div>
      )}
    </div>
  );
}
```

### API Usage
```bash
# Analyze a transaction
curl -X POST /api/fraud-detection \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze_transaction",
    "transactionId": "tx_123",
    "userId": "user_456"
  }'

# Get fraud summary
curl /api/fraud-detection?action=get_fraud_summary
```

## 🔍 Fraud Detection Features

### Transaction Analysis
- **Amount Analysis**: Detects unusually high-value transactions
- **Timing Analysis**: Identifies transactions outside normal business hours
- **Merchant Analysis**: Checks merchant reputation and risk factors
- **Description Analysis**: Scans for suspicious keywords and patterns
- **Pattern Analysis**: Compares against historical transaction patterns

### Behavioral Analysis
- **Spending Patterns**: Analyzes user's historical spending behavior
- **Frequency Analysis**: Detects unusual transaction frequency
- **Category Analysis**: Identifies diverse or suspicious spending categories
- **Anomaly Detection**: Finds deviations from normal user behavior

### Risk Assessment
- **Risk Levels**: LOW (0-30), MEDIUM (31-69), HIGH (70-100)
- **Recommended Actions**: APPROVE, REVIEW, BLOCK, INVESTIGATE
- **Confidence Scores**: 0-100% confidence in the assessment

## 🛠️ Customization

### Adding Custom Risk Factors
Edit `lib/fraud-config.ts` to customize:
- Risk thresholds
- High-risk merchants and categories
- Suspicious keywords
- Time-based risk factors
- Amount-based risk factors

### Custom AI Prompts
Modify the system prompts in `amplify/data/resource.ts`:
```typescript
systemPrompt: `Your custom fraud detection prompt here...`
```

### Adding New AI Routes
Add new generation or conversation routes to the schema:
```typescript
const schema = a.schema({
  // ... existing routes ...
  
  customAnalysis: a.generation({
    aiModel: a.ai.model('Claude 3.5 Haiku'),
    systemPrompt: 'Your custom analysis prompt',
  })
    .arguments({
      // Define your arguments
    })
    .returns(a.ref('YourCustomType'))
    .authorization((allow) => allow.authenticated()),
});
```

## 📈 Monitoring and Analytics

### Key Metrics to Track
- Total transactions analyzed
- High/medium/low risk distribution
- False positive/negative rates
- Analysis response times
- AI model performance

### Alerts and Notifications
- High-risk transaction notifications
- Unusual behavioral patterns
- System performance issues
- API rate limit warnings

## 🔒 Security Considerations

### Data Privacy
- Transaction data is processed securely through AWS Bedrock
- No sensitive data is stored in logs
- All AI interactions are encrypted in transit

### Access Control
- AI routes require authentication
- User-specific data access controls
- Audit logging for all fraud detection activities

### Rate Limiting
- Built-in AWS Bedrock rate limiting
- Consider implementing additional rate limiting for high-volume usage

## 🚨 Troubleshooting

### Common Issues

1. **AI Route Not Found**
   - Ensure the backend is deployed: `npx ampx sandbox`
   - Check that AI routes are properly defined in the schema

2. **Authentication Errors**
   - Verify user is authenticated
   - Check IAM permissions for Bedrock access

3. **Model Access Issues**
   - Ensure Claude 3.5 Haiku is available in your AWS region
   - Verify Bedrock model access permissions

4. **Performance Issues**
   - Monitor response times
   - Consider using Claude 3.5 Haiku for faster responses
   - Implement caching for repeated analyses

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG_FRAUD_DETECTION=true
```

## 🔄 Integration with Existing Workflow

### Transaction Processing
1. **Plaid Webhook** → Transaction ingested
2. **Fraud Analysis** → AI analyzes transaction
3. **Risk Assessment** → Results stored in DetectionItem
4. **Action Workflow** → High-risk transactions trigger alerts

### User Interface
1. **Fraud Dashboard** → Shows risk summaries and alerts
2. **Transaction Analysis** → Individual transaction risk assessment
3. **Behavioral Analysis** → User pattern analysis
4. **Interactive Chat** → AI assistant for fraud questions

## 📚 Additional Resources

- [AWS Amplify AI Documentation](https://docs.amplify.aws/nextjs/ai/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude 3.5 Model Information](https://www.anthropic.com/claude)
- [Fraud Detection Best Practices](https://docs.amplify.aws/nextjs/ai/concepts/)

## 🆘 Support

For issues or questions:
1. Check the logs in `/api/fraud-detection`
2. Review the configuration in `lib/fraud-config.ts`
3. Test with the debug interface at `/debug`
4. Monitor the fraud detection dashboard

---

**Note**: This fraud detection system is designed to assist with risk assessment but should not be the sole determinant for blocking transactions. Always implement proper review processes and human oversight for high-risk decisions.
