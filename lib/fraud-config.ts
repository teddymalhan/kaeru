// Fraud Detection Configuration
export const FRAUD_CONFIG = {
  // Risk thresholds
  RISK_THRESHOLDS: {
    HIGH: 70,
    MEDIUM: 50,
    LOW: 30
  },

  // Fraud detection settings
  SETTINGS: {
    ENABLED: process.env.FRAUD_DETECTION_ENABLED === 'true' || true,
    MODEL_NAME: 'gpt-4',
    TEMPERATURE: 0.1,
    MAX_RETRIES: 3,
    TIMEOUT_MS: 30000
  },

  // Analysis parameters
  ANALYSIS: {
    HISTORICAL_DAYS: 90,
    BEHAVIOR_ANALYSIS_DAYS: 30,
    MIN_TRANSACTIONS_FOR_PATTERN: 5,
    AMOUNT_DEVIATION_THRESHOLD: 3.0, // 300% deviation from average
    FREQUENCY_THRESHOLD_HOURS: 24,
    MAX_TRANSACTIONS_PER_DAY: 10
  },

  // High-risk merchants and categories
  HIGH_RISK_MERCHANTS: [
    'CRYPTO', 'BITCOIN', 'GAMBLING', 'CASINO', 'WIRE_TRANSFER',
    'MONEY_GRAM', 'WESTERN_UNION', 'PAYPAL', 'VENMO', 'CASH_APP',
    'XXX', 'ADULT', 'POKER', 'BETTING', 'LOTTERY'
  ],

  HIGH_RISK_CATEGORIES: [
    'GAMBLING', 'ADULT_ENTERTAINMENT', 'CRYPTOCURRENCY',
    'MONEY_TRANSFER', 'CASH_ADVANCE', 'WIRE_TRANSFER'
  ],

  // Suspicious keywords in descriptions
  SUSPICIOUS_KEYWORDS: [
    'URGENT', 'IMMEDIATE', 'VERIFY', 'CONFIRM', 'SECURITY',
    'ACCOUNT_SUSPENDED', 'FRAUD', 'SCAM', 'PHISHING',
    'CLICK_HERE', 'ACT_NOW', 'LIMITED_TIME'
  ],

  // Time-based risk factors
  TIME_RISK_FACTORS: {
    NIGHT_HOURS: { start: 22, end: 6 }, // 10 PM to 6 AM
    WEEKEND_MULTIPLIER: 1.2,
    HOLIDAY_MULTIPLIER: 1.5
  },

  // Amount-based risk factors
  AMOUNT_RISK_FACTORS: {
    HIGH_VALUE_THRESHOLD: 1000,
    VERY_HIGH_VALUE_THRESHOLD: 5000,
    MICRO_TRANSACTION_THRESHOLD: 1.00
  }
};

// Risk level determination
export function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (riskScore >= FRAUD_CONFIG.RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (riskScore >= FRAUD_CONFIG.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

// Recommended action based on risk level
export function getRecommendedAction(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): 'APPROVE' | 'REVIEW' | 'BLOCK' | 'INVESTIGATE' {
  switch (riskLevel) {
    case 'HIGH': return 'BLOCK';
    case 'MEDIUM': return 'INVESTIGATE';
    case 'LOW': return 'APPROVE';
    default: return 'REVIEW';
  }
}

// Check if fraud detection is enabled
export function isFraudDetectionEnabled(): boolean {
  return FRAUD_CONFIG.SETTINGS.ENABLED && !!process.env.OPENAI_API_KEY;
}

// Get OpenAI API key
export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}
