import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== CANCEL MY STUFF DATA MODELS =========================================
This section defines the data models for the Cancel My Stuff application:
- Transaction: Represents financial transactions from bank/credit card data
- DetectionItem: Represents subscription items detected in transactions
- Artifact: Represents files, documents, or data related to transactions and detections
- AI Routes: Fraud detection and analysis capabilities using AWS Bedrock
=========================================================================*/

const schema = a.schema({
  // Custom types for fraud detection results
  FraudAnalysisResult: a.customType({
    riskLevel: a.enum(["LOW", "MEDIUM", "HIGH"]),
    confidenceScore: a.float(),
    fraudIndicators: a.string().array(),
    suspiciousPatterns: a.string().array(),
    recommendedAction: a.enum(["APPROVE", "REVIEW", "BLOCK", "INVESTIGATE"]),
    reasoning: a.string(),
    additionalRecommendations: a.string().array(),
  }),

  BehavioralAnalysisResult: a.customType({
    behavioralRiskLevel: a.enum(["LOW", "MEDIUM", "HIGH"]),
    confidenceScore: a.float(),
    behavioralAnomalies: a.string().array(),
    spendingPatternAnalysis: a.string(),
    frequencyAnalysis: a.string(),
    categoryAnalysis: a.string(),
    recommendedActions: a.string().array(),
    riskFactors: a.string().array(),
    monitoringRecommendations: a.string().array(),
  }),
  Transaction: a
    .model({
      amount: a.float().required(),
      date: a.date().required(),
      description: a.string().required(),
      merchant: a.string(),
      category: a.string(),
      // Relationships
      detectionItems: a.hasMany("DetectionItem", "transactionId"),
      artifacts: a.hasMany("Artifact", "transactionId"),
    })
    .authorization((allow: any) => [
      allow.owner(),
      allow.publicApiKey().to(["create", "read"]),
    ]),

  DetectionItem: a
    .model({
      itemName: a.string().required(),
      subscriptionType: a.enum(["MONTHLY", "ANNUAL", "WEEKLY", "ONE_TIME"]),
      status: a.enum(["DETECTED", "CONFIRMED", "CANCELLED", "IGNORED"]),
      detectedAmount: a.float(),
      confidence: a.float(),
      cancellationDate: a.date(),
      cancellationUrl: a.url(),
      notes: a.string(),
      // Reference fields for relationships
      transactionId: a.id().required(),
      // Relationships
      transaction: a.belongsTo("Transaction", "transactionId"),
      artifacts: a.hasMany("Artifact", "detectionItemId"),
    })
    .authorization((allow: any) => [
      allow.owner().to(["create", "read", "update", "delete"]),
      allow.publicApiKey().to(["create", "read"]),
    ]),

  Artifact: a
    .model({
      filePath: a.string().required(),
      contentType: a.string().required(),
      fileSize: a.integer(),
      metadata: a.customType({
        originalFileName: a.string(),
        uploadedAt: a.datetime(),
        tags: a.string().array(),
      }),
      artifactType: a.enum(["SCREENSHOT", "DOCUMENT", "RECEIPT", "EMAIL", "OTHER"]),
      // Reference fields for relationships
      transactionId: a.id(),
      detectionItemId: a.id(),
      // Relationships
      transaction: a.belongsTo("Transaction", "transactionId"),
      detectionItem: a.belongsTo("DetectionItem", "detectionItemId"),
    })
    .authorization((allow: any) => [
      allow.owner().to(["create", "read", "update", "delete"]),
      allow.publicApiKey().to(["create", "read"]),
    ]),

  // AI Routes for Fraud Detection
  analyzeTransaction: a.generation({
    aiModel: a.ai.model('Claude 3.5 Haiku'),
    systemPrompt: `You are an expert fraud detection AI agent. Your role is to analyze financial transactions and user behavior patterns to identify potential fraud.

Key responsibilities:
1. Analyze individual transactions for fraud indicators
2. Examine user behavior patterns for anomalies
3. Check merchant reputation and risk factors
4. Provide clear reasoning and recommendations

When analyzing transactions, consider:
- Transaction amount and timing
- Merchant reputation and category
- User's historical spending patterns
- Geographic and temporal anomalies
- Description and metadata analysis

Always provide:
- Clear fraud risk assessment (LOW/MEDIUM/HIGH)
- Specific indicators that triggered the assessment
- Recommended action (APPROVE/REVIEW/BLOCK/INVESTIGATE)
- Detailed reasoning for your decision

Be thorough but efficient in your analysis.`,
  })
    .arguments({
      transactionId: a.string().required(),
      amount: a.float().required(),
      date: a.string().required(),
      description: a.string().required(),
      merchant: a.string(),
      category: a.string(),
      userId: a.string().required(),
    })
    .returns(a.ref('FraudAnalysisResult')),

  analyzeUserBehavior: a.generation({
    aiModel: a.ai.model('Claude 3.5 Haiku'),
    systemPrompt: `You are an expert fraud detection AI agent specializing in behavioral analysis. Analyze user's transaction behavior patterns for fraud indicators.

Focus on:
- Spending pattern deviations from historical norms
- Unusual transaction frequency or timing
- Category diversity and suspicious spending patterns
- Amount variations and outliers
- Temporal patterns and anomalies
- Behavioral consistency analysis

Provide actionable insights for fraud prevention and user protection.`,
  })
    .arguments({
      userId: a.string().required(),
      days: a.integer(),
    })
    .returns(a.ref('BehavioralAnalysisResult')),

  // AI Conversation for interactive fraud detection
  fraudDetectionChat: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Haiku'),
    systemPrompt: `You are an expert fraud detection AI assistant. Help users understand fraud risks, analyze suspicious transactions, and provide guidance on financial security.

You have access to:
- Transaction analysis tools
- User behavior analysis
- Merchant reputation checking
- Historical pattern analysis

Always provide clear, actionable advice and explain your reasoning in simple terms.`,
    tools: [
      a.ai.dataTool({
        name: 'TransactionQuery',
        description: 'Searches for Transaction records to analyze patterns',
        model: a.ref('Transaction'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'DetectionItemQuery',
        description: 'Searches for DetectionItem records to analyze subscription patterns',
        model: a.ref('DetectionItem'),
        modelOperation: 'list',
      }),
    ],
  })
    .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
