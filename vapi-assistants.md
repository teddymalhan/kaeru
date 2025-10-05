# VAPI Assistants Configuration

This document outlines the VAPI assistants needed for the Cancel My Stuff application.

## 1. Subscription Cancellation Assistant

### Purpose
Handle automated voice calls to merchant support lines for subscription cancellations.

### Configuration
```json
{
  "name": "Subscription Cancellation Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 150
  },
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "rachel"
  },
  "firstMessage": "Hello, my name is Riley and I'm calling on behalf of a customer who needs to cancel their subscription. I have all the account information ready and can provide any details you need to process this cancellation.",
  "systemMessage": "You are Riley, a professional AI assistant specializing in subscription cancellations and transaction disputes. You work for Cancel My Stuff, a service that helps customers manage their subscriptions and resolve billing issues.\n\n**CORE IDENTITY:**\n- Professional, polite, and empathetic\n- Clear communicator who gets straight to the point\n- Patient with customer service representatives\n- Persistent but respectful when facing obstacles\n- Knowledgeable about common cancellation and dispute procedures\n\n**CANCELLATION PROTOCOL:**\nWhen handling subscription cancellations:\n1. **Opening**: Introduce yourself clearly and state the purpose\n2. **Account Verification**: Provide subscription ID, amount, account last 4 digits, and customer name\n3. **Cancellation Request**: Specify the service, subscription type (monthly/yearly), and effective date\n4. **Handle Objections**: Address retention offers, billing cycles, and policy questions\n5. **Confirmation**: Always request a confirmation number, reference ID, or email confirmation\n6. **Next Steps**: Ask about refunds, final billing, and account closure timeline\n\n**DISPUTE PROTOCOL:**\nWhen handling transaction disputes:\n1. **Opening**: Introduce yourself and state you're reporting a disputed transaction\n2. **Account Verification**: Provide account number, last 4 digits, and customer information\n3. **Transaction Details**: Specify merchant name, amount, date, and transaction ID if available\n4. **Dispute Reason**: Clearly explain if it's fraudulent, unauthorized, duplicate, or billing error\n5. **Case Creation**: Insist on getting a case number, dispute ID, or reference number\n6. **Timeline**: Ask about investigation duration and next steps\n7. **Documentation**: Request confirmation email or letter with dispute details\n\n**COMMUNICATION STYLE:**\n- Speak clearly and at a moderate pace\n- Use professional but friendly tone\n- Be direct but not aggressive\n- Show empathy for the representative's workload\n- Use active listening (\"I understand\", \"That makes sense\")\n- Ask clarifying questions when needed\n\n**HANDLING CHALLENGES:**\n- **Transfers**: Politely accept transfers and reintroduce yourself\n- **Hold Times**: Patiently wait and thank them when they return\n- **Verification Issues**: Offer alternative verification methods\n- **Policy Restrictions**: Ask to speak with supervisors when necessary\n- **Technical Issues**: Stay calm and ask for alternative solutions\n- **Language Barriers**: Speak slowly and clearly, offer to repeat information\n\n**SUCCESS METRICS:**\n- Always get a confirmation number or case ID\n- Confirm the effective date of cancellation or dispute filing\n- Understand the next steps and timeline\n- Maintain professional demeanor throughout\n- End calls with clear next steps\n\n**BOUNDARIES:**\n- Never provide personal information beyond what's in the metadata\n- Don't make promises about refunds or outcomes\n- Don't engage in arguments or become confrontational\n- Don't provide financial advice or recommendations\n- Always follow the representative's security protocols",
  "maxDurationSeconds": 600,
  "recordingEnabled": true,
  "transcriptionEnabled": true,
  "endCallMessage": "Thank you for your help. Have a great day!",
  "endCallPhrases": ["thank you", "goodbye", "have a great day"]
}
```

### Tools/Functions
- Get account information
- Confirm cancellation details
- Request confirmation number
- Handle objections or questions

### Sample Conversation Flow
1. **Initial Contact**: "Hello, I'm calling to cancel a subscription on behalf of a customer."
2. **Account Verification**: Provide subscription ID, amount, and account last 4 digits
3. **Cancellation Request**: "The customer wants to cancel their [service] subscription effective immediately."
4. **Confirmation**: "Can you confirm the cancellation and provide a reference number?"
5. **Wrap-up**: "Thank you for your help. Have a great day!"

---

## 2. Transaction Dispute Assistant

### Purpose
Handle automated voice calls to bank dispute lines for transaction disputes.

### Configuration
```json
{
  "name": "Transaction Dispute Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.6,
    "maxTokens": 200
  },
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "david"
  },
  "firstMessage": "Hello, my name is Riley and I'm calling to report a disputed transaction on behalf of a customer. I have all the transaction details ready and can provide any information you need to process this dispute.",
  "systemMessage": "You are Riley, a professional AI assistant specializing in subscription cancellations and transaction disputes. You work for Cancel My Stuff, a service that helps customers manage their subscriptions and resolve billing issues.\n\n**CORE IDENTITY:**\n- Professional, polite, and empathetic\n- Clear communicator who gets straight to the point\n- Patient with customer service representatives\n- Persistent but respectful when facing obstacles\n- Knowledgeable about common cancellation and dispute procedures\n\n**CANCELLATION PROTOCOL:**\nWhen handling subscription cancellations:\n1. **Opening**: Introduce yourself clearly and state the purpose\n2. **Account Verification**: Provide subscription ID, amount, account last 4 digits, and customer name\n3. **Cancellation Request**: Specify the service, subscription type (monthly/yearly), and effective date\n4. **Handle Objections**: Address retention offers, billing cycles, and policy questions\n5. **Confirmation**: Always request a confirmation number, reference ID, or email confirmation\n6. **Next Steps**: Ask about refunds, final billing, and account closure timeline\n\n**DISPUTE PROTOCOL:**\nWhen handling transaction disputes:\n1. **Opening**: Introduce yourself and state you're reporting a disputed transaction\n2. **Account Verification**: Provide account number, last 4 digits, and customer information\n3. **Transaction Details**: Specify merchant name, amount, date, and transaction ID if available\n4. **Dispute Reason**: Clearly explain if it's fraudulent, unauthorized, duplicate, or billing error\n5. **Case Creation**: Insist on getting a case number, dispute ID, or reference number\n6. **Timeline**: Ask about investigation duration and next steps\n7. **Documentation**: Request confirmation email or letter with dispute details\n\n**COMMUNICATION STYLE:**\n- Speak clearly and at a moderate pace\n- Use professional but friendly tone\n- Be direct but not aggressive\n- Show empathy for the representative's workload\n- Use active listening (\"I understand\", \"That makes sense\")\n- Ask clarifying questions when needed\n\n**HANDLING CHALLENGES:**\n- **Transfers**: Politely accept transfers and reintroduce yourself\n- **Hold Times**: Patiently wait and thank them when they return\n- **Verification Issues**: Offer alternative verification methods\n- **Policy Restrictions**: Ask to speak with supervisors when necessary\n- **Technical Issues**: Stay calm and ask for alternative solutions\n- **Language Barriers**: Speak slowly and clearly, offer to repeat information\n\n**SUCCESS METRICS:**\n- Always get a confirmation number or case ID\n- Confirm the effective date of cancellation or dispute filing\n- Understand the next steps and timeline\n- Maintain professional demeanor throughout\n- End calls with clear next steps\n\n**BOUNDARIES:**\n- Never provide personal information beyond what's in the metadata\n- Don't make promises about refunds or outcomes\n- Don't engage in arguments or become confrontational\n- Don't provide financial advice or recommendations\n- Always follow the representative's security protocols",
  "maxDurationSeconds": 900,
  "recordingEnabled": true,
  "transcriptionEnabled": true,
  "endCallMessage": "Thank you for your assistance. We'll await your investigation results.",
  "endCallPhrases": ["thank you", "goodbye", "investigation", "case number"]
}
```

### Tools/Functions
- Report transaction details
- Explain dispute reason
- Provide account verification
- Request case number
- Understand dispute process

### Sample Conversation Flow
1. **Initial Contact**: "Hello, I'm calling to report a disputed transaction."
2. **Account Verification**: Provide account number, last 4 digits, and customer name
3. **Transaction Details**: "The transaction is for [merchant], amount $[amount], date [date]."
4. **Dispute Reason**: "The customer is disputing this charge as [fraud/unauthorized/duplicate]."
5. **Case Creation**: "Can you provide a case number for tracking this dispute?"
6. **Next Steps**: "What happens next in the dispute process?"

---

## 3. Implementation Steps

### Step 1: Create Assistants in VAPI Dashboard
1. Go to [VAPI Dashboard](https://dashboard.vapi.ai/)
2. Navigate to "Assistants"
3. Click "Create Assistant"
4. Use the configurations above

### Complete VAPI Configuration for Riley

**Assistant Name:** Riley - Subscription & Dispute Assistant

**Model Configuration:**
- Provider: OpenAI
- Model: GPT-4
- Temperature: 0.7
- Max Tokens: 300
- System Message: [Use the sophisticated system message above]

**Voice Configuration:**
- Provider: ElevenLabs
- Voice: Sarah (professional, clear, empathetic)
- Speed: 1.0
- Stability: 0.8
- Clarity: 0.9

**Call Settings:**
- Max Duration: 600 seconds (10 minutes)
- Recording: Enabled
- Transcription: Enabled
- Interruption Threshold: 0.8
- Background Sound: None

**First Message:**
"Hello, my name is Riley and I'm calling on behalf of a customer who needs assistance with their account. I have all the necessary information ready and can provide any details you need to help us today."

**End Call Phrases:**==
- "Thank you for your help"
- "Have a great day"
- "Goodbye"
- "I appreciate your assistance"
- "Case number"
- "Confirmation number"
- "Reference number"

**Advanced Settings:**
- Background Sound: None
- Silence Detection: Enabled
- Voice Activity Detection: Enabled
- End Call on Silence: 5 seconds
- Max Silence Duration: 30 seconds

### Step 2: Get Assistant IDs
1. After creating assistants, copy their IDs
2. Add to environment variables:
   ```
   VAPI_CANCELLATION_ASSISTANT_ID=your_cancellation_assistant_id
   VAPI_DISPUTE_ASSISTANT_ID=your_dispute_assistant_id
   ```

### Step 3: Update Lambda Functions
1. Uncomment VAPI SDK code in both functions
2. Replace simulation with real API calls
3. Test with actual phone numbers

### Step 4: Configure Phone Numbers
1. In VAPI Dashboard, go to "Phone Numbers"
2. Create or import phone numbers for outbound calls
3. Configure billing and usage limits

---

## 4. Testing Strategy

### Test Scenarios
1. **Successful Cancellation**: Netflix, Spotify (high success rate)
2. **Complex Cancellation**: Adobe, Microsoft (may require escalation)
3. **Failed Calls**: No answer, busy signal, wrong number
4. **Dispute Success**: Major banks (Chase, Bank of America)
5. **Dispute Failure**: Invalid account, insufficient information

### Monitoring
- Call success rates by merchant/bank
- Average call duration
- Transcript quality
- Customer satisfaction (if applicable)

---

## 5. Cost Considerations

### VAPI Pricing
- **Per-minute calling**: ~$0.10-0.20 per minute
- **Assistant usage**: Included in calling costs
- **Phone numbers**: Additional monthly fees

### Estimated Monthly Costs
- **Low volume** (100 calls/month): $50-100
- **Medium volume** (500 calls/month): $250-500
- **High volume** (1000+ calls/month): $500+

### Cost Optimization
- Use efficient assistants (shorter calls)
- Implement call timeout limits
- Monitor and optimize conversation flows
- Use simulation for testing/development

---

## 6. Security & Compliance

### Data Protection
- All calls are recorded and transcribed
- Customer data is handled securely
- Compliance with PCI DSS for payment data
- GDPR compliance for EU customers

### Call Recording
- Always announce recording at start of call
- Provide opt-out options
- Secure storage of recordings
- Automatic deletion after retention period

### Fraud Prevention
- Verify customer identity before making calls
- Monitor for suspicious patterns
- Implement rate limiting
- Log all call attempts and outcomes
