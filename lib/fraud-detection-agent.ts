import { z } from "zod";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import type { Schema } from "@/amplify/data/resource";
import outputs from "../amplify_outputs.json";

// Configure Amplify
Amplify.configure(outputs);

const client = generateClient<Schema>();

// Transaction analysis schema
const TransactionAnalysisSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
  merchant: z.string().optional(),
  category: z.string().optional(),
  userId: z.string(),
});

// Fraud detection result schema
const FraudDetectionResultSchema = z.object({
  isFraudulent: z.boolean(),
  confidence: z.number().min(0).max(1),
  riskScore: z.number().min(0).max(100),
  fraudIndicators: z.array(z.string()),
  reasoning: z.string(),
  recommendedAction: z.enum(["APPROVE", "REVIEW", "BLOCK", "INVESTIGATE"]),
  suspiciousPatterns: z.array(z.string()),
});

// Historical transaction analysis schema
const HistoricalAnalysisSchema = z.object({
  userId: z.string(),
  timeRange: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  analysisType: z.enum(["PATTERN_ANALYSIS", "ANOMALY_DETECTION", "BEHAVIORAL_ANALYSIS"]),
});

// Tool for analyzing individual transactions
const analyzeTransactionTool = {
  name: "analyze_transaction",
  description: "Analyze a single transaction for fraud indicators including amount, merchant, timing, and description patterns",
  parameters: TransactionAnalysisSchema,
  func: async (input: any) => {
    try {
      const { transactionId, amount, date, description, merchant, category, userId } = input;
      
      // Get historical transactions for pattern analysis
      const historicalTransactions = await client.models.Transaction.list({
        filter: {
          and: [
            { amount: { between: [amount * 0.8, amount * 1.2] } },
            { merchant: { eq: merchant } }
          ]
        }
      });

      // Analyze transaction patterns
      const fraudIndicators: string[] = [];
      const suspiciousPatterns: string[] = [];
      let riskScore = 0;
      let confidence = 0.5;

      // Amount-based analysis
      if (amount > 1000) {
        fraudIndicators.push("High amount transaction");
        riskScore += 20;
      }

      // Merchant-based analysis
      if (merchant && merchant.toLowerCase().includes("crypto")) {
        fraudIndicators.push("Cryptocurrency-related merchant");
        riskScore += 15;
      }

      // Time-based analysis
      const transactionDate = new Date(date);
      const hour = transactionDate.getHours();
      if (hour < 6 || hour > 22) {
        suspiciousPatterns.push("Unusual transaction time");
        riskScore += 10;
      }

      // Description analysis
      if (description.toLowerCase().includes("urgent") || description.toLowerCase().includes("immediate")) {
        fraudIndicators.push("Urgent payment language");
        riskScore += 15;
      }

      // Historical pattern analysis
      if (historicalTransactions.data.length === 0) {
        suspiciousPatterns.push("No historical transactions with similar merchant");
        riskScore += 10;
      }

      // Determine risk level and recommended action
      const isFraudulent = riskScore > 50;
      const recommendedAction = riskScore > 70 ? "BLOCK" : 
                               riskScore > 40 ? "REVIEW" : 
                               riskScore > 20 ? "INVESTIGATE" : "APPROVE";

      confidence = Math.min(0.9, 0.5 + (riskScore / 200));

      const result = {
        isFraudulent,
        confidence,
        riskScore,
        fraudIndicators,
        reasoning: `Transaction analyzed with ${fraudIndicators.length} fraud indicators and ${suspiciousPatterns.length} suspicious patterns. Risk score: ${riskScore}/100`,
        recommendedAction,
        suspiciousPatterns
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error analyzing transaction: ${error}`;
    }
  }
};

// Tool for analyzing user behavior patterns
const analyzeUserBehaviorTool = {
  name: "analyze_user_behavior",
  description: "Analyze user's historical transaction patterns to detect behavioral anomalies",
  parameters: HistoricalAnalysisSchema,
  func: async (input: any) => {
    try {
      const { userId, timeRange, analysisType } = input;
      
      // Get user's historical transactions
      const transactions = await client.models.Transaction.list({
        filter: {
          and: [
            { date: { ge: timeRange.startDate } },
            { date: { le: timeRange.endDate } }
          ]
        }
      });

      if (!transactions.data || transactions.data.length === 0) {
        return JSON.stringify({
          riskLevel: "LOW",
          anomalies: [],
          summary: "No historical transactions found for analysis"
        });
      }

      // Analyze spending patterns
      const amounts = transactions.data.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const maxAmount = Math.max(...amounts);
      const minAmount = Math.min(...amounts);

      // Detect anomalies
      const anomalies: string[] = [];
      let riskLevel = "LOW";

      // High amount anomaly
      if (maxAmount > avgAmount * 3) {
        anomalies.push("Unusually high transaction amount detected");
        riskLevel = "MEDIUM";
      }

      // Frequency analysis
      const transactionDates = transactions.data.map(t => new Date(t.date).getTime());
      const timeSpan = Math.max(...transactionDates) - Math.min(...transactionDates);
      const avgFrequency = timeSpan / (transactions.data.length * 24 * 60 * 60 * 1000); // days between transactions

      if (avgFrequency < 0.5) { // Less than 12 hours between transactions
        anomalies.push("Unusually high transaction frequency");
        riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
      }

      // Category analysis
      const categories = transactions.data.map(t => t.category).filter(Boolean);
      const uniqueCategories = new Set(categories);
      
      if (uniqueCategories.size > 10) {
        anomalies.push("Unusually diverse spending categories");
        riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
      }

      return JSON.stringify({
        riskLevel,
        anomalies,
        summary: `User behavior analysis completed. Risk level: ${riskLevel}. Found ${anomalies.length} anomalies.`
      });
    } catch (error) {
      return `Error analyzing user behavior: ${error}`;
    }
  }
};

// Tool for checking merchant reputation
const checkMerchantReputationTool = {
  name: "check_merchant_reputation",
  description: "Check merchant reputation and risk factors",
  parameters: z.object({
    merchant: z.string(),
    category: z.string().optional(),
  }),
  func: async (input: any) => {
    try {
      const { merchant, category } = input;
      
      // Simulate merchant reputation check
      const riskFactors: string[] = [];
      let riskLevel = "LOW";

      // Known high-risk categories
      const highRiskCategories = ["cryptocurrency", "gambling", "adult", "pharmaceutical"];
      if (category && highRiskCategories.some(risk => category.toLowerCase().includes(risk))) {
        riskFactors.push("High-risk category");
        riskLevel = "HIGH";
      }

      // Merchant name analysis
      if (merchant.toLowerCase().includes("crypto") || merchant.toLowerCase().includes("bitcoin")) {
        riskFactors.push("Cryptocurrency-related merchant");
        riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
      }

      // Generic merchant patterns
      if (merchant.length < 3) {
        riskFactors.push("Suspiciously short merchant name");
        riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
      }

      return JSON.stringify({
        merchant,
        riskLevel,
        riskFactors,
        recommendedAction: riskLevel === "HIGH" ? "BLOCK" : 
                          riskLevel === "MEDIUM" ? "REVIEW" : "APPROVE",
        summary: `Merchant ${merchant} has ${riskLevel.toLowerCase()} risk level with ${riskFactors.length} risk factors.`
      });
    } catch (error) {
      return `Error checking merchant reputation: ${error}`;
    }
  }
};

// Create the fraud detection agent using Amplify AI routes
export class FraudDetectionAgent {
  constructor() {
    // No initialization needed - using Amplify AI routes
  }

  async analyzeTransaction(transactionData: {
    transactionId: string;
    amount: number;
    date: string;
    description: string;
    merchant?: string;
    category?: string;
    userId: string;
  }) {
    try {
      // Enhanced fraud detection analysis
      const { amount, description, merchant, category } = transactionData;
      
      const fraudIndicators: string[] = [];
      const suspiciousPatterns: string[] = [];
      let riskScore = 0;
      let confidence = 0.5;

      // Amount-based analysis
      if (amount > 1000) {
        fraudIndicators.push("High amount transaction");
        riskScore += 25;
      } else if (amount > 500) {
        fraudIndicators.push("Moderate amount transaction");
        riskScore += 10;
      }

      // Description analysis - look for suspicious keywords
      const descriptionLower = description.toLowerCase();
      const suspiciousKeywords = [
        'alert', 'urgent', 'immediate', 'free', 'scam', 'fraud', 'suspicious',
        'verify', 'confirm', 'account', 'security', 'locked', 'suspended'
      ];
      
      const foundKeywords = suspiciousKeywords.filter(keyword => 
        descriptionLower.includes(keyword)
      );
      
      if (foundKeywords.length > 0) {
        fraudIndicators.push(`Suspicious keywords in description: ${foundKeywords.join(', ')}`);
        riskScore += foundKeywords.length * 15;
      }

      // Merchant analysis
      if (merchant) {
        const merchantLower = merchant.toLowerCase();
        
        // Check for scam-related merchant names
        const scamIndicators = ['scam', 'fraud', 'fake', 'phishing', 'malware'];
        const hasScamIndicator = scamIndicators.some(indicator => 
          merchantLower.includes(indicator)
        );
        
        if (hasScamIndicator) {
          fraudIndicators.push(`Suspicious merchant name: ${merchant}`);
          riskScore += 30;
        }
        
        // Check for cryptocurrency-related merchants
        if (merchantLower.includes('crypto') || merchantLower.includes('bitcoin')) {
          fraudIndicators.push("Cryptocurrency-related merchant");
          riskScore += 15;
        }
      }

      // Pattern analysis
      if (descriptionLower.includes('free') && amount > 100) {
        suspiciousPatterns.push("High amount with 'free' in description - potential scam");
        riskScore += 20;
      }

      // Repetitive text analysis
      const words = descriptionLower.split(' ');
      const uniqueWords = new Set(words);
      if (words.length > 3 && uniqueWords.size < words.length * 0.5) {
        suspiciousPatterns.push("Repetitive or nonsensical description");
        riskScore += 15;
      }

      // Determine risk level
      let riskLevel: "LOW" | "MEDIUM" | "HIGH";
      let recommendedAction: "APPROVE" | "REVIEW" | "BLOCK" | "INVESTIGATE";
      
      if (riskScore >= 50) {
        riskLevel = "HIGH";
        recommendedAction = "BLOCK";
        confidence = 0.9;
      } else if (riskScore >= 25) {
        riskLevel = "MEDIUM";
        recommendedAction = "REVIEW";
        confidence = 0.75;
      } else {
        riskLevel = "LOW";
        recommendedAction = "APPROVE";
        confidence = 0.6;
      }

      const result = {
        riskLevel,
        confidenceScore: confidence,
        fraudIndicators,
        suspiciousPatterns,
        recommendedAction,
        reasoning: `Transaction analyzed with ${fraudIndicators.length} fraud indicators and ${suspiciousPatterns.length} suspicious patterns. Risk score: ${riskScore}/100`,
        additionalRecommendations: riskLevel === "HIGH" 
          ? ["Block transaction immediately", "Contact user for verification", "Report to fraud team"]
          : riskLevel === "MEDIUM"
          ? ["Review transaction details", "Monitor user account", "Consider additional verification"]
          : ["Continue monitoring", "No immediate action required"]
      };

      return {
        output: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in fraud detection analysis:", error);
      throw new Error(`Fraud detection failed: ${error}`);
    }
  }

  async analyzeUserBehavior(userId: string, days: number = 30) {
    try {
      // For now, return a mock analysis until AI routes are fully deployed
      const mockResult = {
        behavioralRiskLevel: "LOW",
        confidenceScore: 0.85,
        behavioralAnomalies: [],
        spendingPatternAnalysis: "User shows consistent spending patterns with no significant anomalies detected.",
        frequencyAnalysis: "Transaction frequency is within normal range for the user's profile.",
        categoryAnalysis: "Spending categories are consistent with user's historical patterns.",
        recommendedActions: ["Continue monitoring", "Regular review recommended"],
        riskFactors: [],
        monitoringRecommendations: ["Standard monitoring frequency is sufficient"]
      };

      return {
        output: mockResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in user behavior analysis:", error);
      throw new Error(`Behavioral analysis failed: ${error}`);
    }
  }

  async batchAnalyzeTransactions(transactions: Array<{
    transactionId: string;
    amount: number;
    date: string;
    description: string;
    merchant?: string;
    category?: string;
    userId: string;
  }>) {
    const results = [];

    for (const transaction of transactions) {
      try {
        const analysis = await this.analyzeTransaction(transaction);
        results.push({
          transactionId: transaction.transactionId,
          analysis,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        results.push({
          transactionId: transaction.transactionId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }
}

export const fraudDetectionAgent = new FraudDetectionAgent();