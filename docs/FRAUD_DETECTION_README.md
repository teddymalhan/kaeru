# 🛡️ Fraud Detection Agent

This document describes the AI-powered fraud detection system integrated into the Cancel My Stuff application.

## Overview

The fraud detection system uses LangChain and OpenAI's GPT-4 to analyze financial transactions and detect potential fraudulent activity. It provides real-time risk assessment, behavioral analysis, and merchant reputation checking.

## Features

### 🔍 Transaction Analysis
- **Amount Analysis**: Detects unusually high-value transactions
- **Timing Analysis**: Identifies transactions outside normal business hours
- **Merchant Analysis**: Checks merchant reputation and risk factors
- **Description Analysis**: Scans for suspicious keywords and patterns
- **Pattern Analysis**: Compares against historical transaction patterns

### 📊 Behavioral Analysis
- **Spending Patterns**: Analyzes user's historical spending behavior
- **Frequency Analysis**: Detects unusual transaction frequency
- **Category Analysis**: Identifies diverse or suspicious spending categories
- **Anomaly Detection**: Finds deviations from normal user behavior

### 🏪 Merchant Reputation
- **Risk Categories**: Identifies high-risk merchant types
- **Blacklist Checking**: Flags known fraudulent merchants
- **Category Risk Assessment**: Evaluates transaction categories for risk

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Transaction   │───▶│  Fraud Detection │───▶│  Risk Assessment│
│     Data        │    │      Agent       │    │   & Actions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   LangChain AI   │
                       │   (GPT-4)        │
                       └──────────────────┘
```

## Components

### 1. FraudDetectionAgent (`lib/fraud-detection-agent.ts`)
The main AI agent that orchestrates fraud detection using LangChain tools:

- **analyzeTransactionTool**: Analyzes individual transactions
- **analyzeUserBehaviorTool**: Examines user behavior patterns
- **checkMerchantReputationTool**: Evaluates merchant risk

### 2. API Endpoint (`app/api/fraud-detection/route.ts`)
RESTful API for fraud detection operations:

- `POST /api/fraud-detection` - Analyze transactions
- `GET /api/fraud-detection` - Get fraud summaries and reports

### 3. UI Component (`app/components/FraudDetectionPanel.tsx`)
React component for displaying fraud detection results:

- Fraud summary dashboard
- High-risk transaction alerts
- Analysis controls and settings

## Usage

### Basic Transaction Analysis

```typescript
import { fraudDetectionAgent } from '@/lib/fraud-detection-agent';

const result = await fraudDetectionAgent.analyzeTransaction({
  transactionId: 'tx_123',
  amount: -150.00,
  date: '2024-01-15T14:30:00Z',
  description: 'Online Purchase',
  merchant: 'Suspicious Store',
  category: 'Shopping',
  userId: 'user_456'
});
```

### User Behavior Analysis

```typescript
const behaviorAnalysis = await fraudDetectionAgent.analyzeUserBehavior(
  'user_456', 
  30 // days
);
```

### API Usage

```bash
# Analyze a specific transaction
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

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
FRAUD_DETECTION_ENABLED=true
FRAUD_RISK_THRESHOLD_HIGH=70
FRAUD_RISK_THRESHOLD_MEDIUM=50
FRAUD_RISK_THRESHOLD_LOW=30
```

### Risk Thresholds

- **HIGH Risk** (70+): Immediate blocking recommended
- **MEDIUM Risk** (50-69): Investigation required
- **LOW Risk** (30-49): Review recommended
- **SAFE** (<30): Approve automatically

## Risk Factors

### Transaction-Level Factors
- High-value transactions (>$1000)
- Unusual timing (late night/early morning)
- Suspicious merchant categories
- Duplicate transactions
- Unusual amounts compared to history

### Behavioral Factors
- Spending pattern deviations
- Unusual transaction frequency
- Diverse spending categories
- Geographic anomalies

### Merchant Factors
- High-risk merchant types (crypto, gambling, adult)
- Blacklisted merchants
- Suspicious merchant names
- Unverified merchants

## Integration

### With Existing Workflow

The fraud detection system integrates seamlessly with your existing transaction processing:

1. **Transaction Ingestion**: Plaid webhooks trigger fraud analysis
2. **Detection Items**: Fraud analysis results are stored in DetectionItem notes
3. **Action Workflows**: High-risk transactions can trigger automatic actions
4. **User Interface**: Fraud dashboard shows risk assessments

### Customization

You can customize the fraud detection system by:

1. **Modifying Risk Thresholds**: Update `lib/fraud-config.ts`
2. **Adding Custom Tools**: Extend the agent with new analysis tools
3. **Custom Prompts**: Modify the LangChain prompts for specific use cases
4. **Integration Hooks**: Add custom actions for different risk levels

## Monitoring

### Key Metrics
- Total transactions analyzed
- High/medium/low risk distribution
- False positive/negative rates
- Analysis response times

### Alerts
- High-risk transaction notifications
- Unusual behavioral patterns
- System performance issues
- API rate limit warnings

## Security Considerations

- **API Key Protection**: Store OpenAI API keys securely
- **Data Privacy**: Transaction data is processed securely
- **Rate Limiting**: Implement API rate limiting
- **Audit Logging**: Log all fraud detection activities
- **Access Control**: Restrict fraud detection access

## Performance

### Optimization Tips
- Batch analyze multiple transactions
- Cache merchant reputation data
- Use async processing for large datasets
- Implement circuit breakers for API calls

### Scaling
- Use connection pooling for database queries
- Implement horizontal scaling for high volume
- Consider dedicated fraud detection infrastructure
- Use message queues for async processing

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify rate limits
   - Monitor usage quotas

2. **Analysis Failures**
   - Check transaction data completeness
   - Verify database connectivity
   - Review error logs

3. **Performance Issues**
   - Monitor response times
   - Check database query performance
   - Review API call patterns

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_FRAUD_DETECTION=true
```

## Future Enhancements

- **Machine Learning Models**: Train custom fraud detection models
- **Real-time Streaming**: Process transactions in real-time
- **Advanced Analytics**: Implement more sophisticated pattern recognition
- **Multi-language Support**: Support for international transactions
- **Integration APIs**: Connect with external fraud detection services

## Support

For issues or questions about the fraud detection system:

1. Check the logs in `/api/fraud-detection`
2. Review the configuration in `lib/fraud-config.ts`
3. Test with the debug interface at `/debug`
4. Monitor the fraud detection dashboard

---

**Note**: This fraud detection system is designed to assist with risk assessment but should not be the sole determinant for blocking transactions. Always implement proper review processes and human oversight for high-risk decisions.
