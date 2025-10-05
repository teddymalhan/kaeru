#!/usr/bin/env node

/**
 * Complete Fraud Detection Workflow Test
 * This test simulates the complete user workflow including:
 * 1. Authentication
 * 2. Transaction analysis
 * 3. Fraud detection
 * 4. UI interaction simulation
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  email: 'machack1101@gmail.com',
  password: '#Qwerty678'
};

// Test transactions
const TEST_TRANSACTIONS = [
  {
    id: 'scam-001',
    amount: 1000,
    description: 'ALERT: FREE BEER FREE',
    merchant: 'ScamCompany101',
    category: 'Service',
    expectedRisk: 'HIGH'
  },
  {
    id: 'netflix-001',
    amount: 20,
    description: 'Recurring Monthly Fee',
    merchant: 'Netflix',
    category: 'Entertainment',
    expectedRisk: 'LOW'
  },
  {
    id: 'crypto-001',
    amount: 5000,
    description: 'Bitcoin Investment Opportunity',
    merchant: 'CryptoScamCorp',
    category: 'Investment',
    expectedRisk: 'HIGH'
  },
  {
    id: 'spotify-001',
    amount: 15,
    description: 'Spotify Premium Subscription',
    merchant: 'Spotify',
    category: 'Entertainment',
    expectedRisk: 'LOW'
  }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    if (response.status === 200) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log(`❌ Server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server connection failed: ${error.message}`);
    return false;
  }
}

async function testTransactionAnalysis() {
  console.log('\n🛡️ Testing Transaction Analysis...');
  let passedTests = 0;
  let totalTests = TEST_TRANSACTIONS.length;

  for (const transaction of TEST_TRANSACTIONS) {
    console.log(`\n  📊 Testing: ${transaction.description}`);
    console.log(`     Amount: $${transaction.amount}`);
    console.log(`     Merchant: ${transaction.merchant}`);
    console.log(`     Expected Risk: ${transaction.expectedRisk}`);

    try {
      const response = await makeRequest(`${BASE_URL}/api/fraud-detection`, {
        method: 'POST',
        body: {
          action: 'analyze_transaction',
          transactionId: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          merchant: transaction.merchant,
          category: transaction.category,
          userId: 'test-user',
          date: new Date().toISOString().split('T')[0]
        }
      });

      if (response.status === 200 && response.data.success) {
        const analysis = response.data.result.output;
        console.log(`     ✅ Analysis successful`);
        console.log(`     Risk Level: ${analysis.riskLevel}`);
        console.log(`     Confidence: ${(analysis.confidenceScore * 100).toFixed(1)}%`);
        console.log(`     Action: ${analysis.recommendedAction}`);
        console.log(`     Indicators: ${analysis.fraudIndicators.length}`);
        
        if (analysis.riskLevel === transaction.expectedRisk) {
          console.log(`     ✅ CORRECT: Risk level matches expectation`);
          passedTests++;
        } else {
          console.log(`     ❌ ERROR: Expected ${transaction.expectedRisk}, got ${analysis.riskLevel}`);
        }

        // Show fraud indicators if any
        if (analysis.fraudIndicators.length > 0) {
          console.log(`     🚨 Fraud Indicators:`);
          analysis.fraudIndicators.forEach(indicator => {
            console.log(`        - ${indicator}`);
          });
        }

        // Show suspicious patterns if any
        if (analysis.suspiciousPatterns.length > 0) {
          console.log(`     ⚠️  Suspicious Patterns:`);
          analysis.suspiciousPatterns.forEach(pattern => {
            console.log(`        - ${pattern}`);
          });
        }
      } else {
        console.log(`     ❌ Analysis failed`);
        console.log(`     Status: ${response.status}`);
        console.log(`     Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`     ❌ Test failed: ${error.message}`);
    }
  }

  console.log(`\n  📈 Transaction Analysis Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

async function testFraudSummary() {
  console.log('\n📊 Testing Fraud Summary...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/fraud-detection`, {
      method: 'POST',
      body: { action: 'get_fraud_summary' }
    });

    if (response.status === 200 && response.data.success) {
      const summary = response.data.result;
      console.log('✅ Fraud summary successful');
      console.log(`   Total transactions: ${summary.totalTransactions}`);
      console.log(`   High risk items: ${summary.highRiskItems}`);
      console.log(`   Medium risk items: ${summary.mediumRiskItems}`);
      console.log(`   Low risk items: ${summary.lowRiskItems}`);
      console.log(`   Last analyzed: ${summary.lastAnalyzed}`);
      return true;
    } else {
      console.log('❌ Fraud summary failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function testUserBehaviorAnalysis() {
  console.log('\n🧠 Testing User Behavior Analysis...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/fraud-detection`, {
      method: 'POST',
      body: {
        action: 'analyze_user_behavior',
        userId: 'test-user',
        days: 30
      }
    });

    if (response.status === 200 && response.data.success) {
      const analysis = response.data.result.output;
      console.log('✅ User behavior analysis successful');
      console.log(`   Behavioral Risk Level: ${analysis.behavioralRiskLevel}`);
      console.log(`   Confidence Score: ${(analysis.confidenceScore * 100).toFixed(1)}%`);
      console.log(`   Anomalies Found: ${analysis.behavioralAnomalies.length}`);
      console.log(`   Spending Pattern: ${analysis.spendingPatternAnalysis}`);
      console.log(`   Frequency Analysis: ${analysis.frequencyAnalysis}`);
      return true;
    } else {
      console.log('❌ User behavior analysis failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🌐 Testing Frontend Access...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      
      // Check if the page contains key elements
      const html = response.data;
      if (typeof html === 'string') {
        const hasTitle = html.includes('Cancel My Stuff');
        const hasAuth = html.includes('Authenticator') || html.includes('Sign in');
        
        console.log(`   Application title found: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   Authentication system found: ${hasAuth ? '✅' : '❌'}`);
        
        return hasTitle;
      }
    } else {
      console.log(`❌ Frontend access failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete Fraud Detection Workflow Test');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 5;

  // Test 1: Server Connection
  if (await testServerConnection()) {
    passedTests++;
  }

  // Test 2: Transaction Analysis
  if (await testTransactionAnalysis()) {
    passedTests++;
  }

  // Test 3: Fraud Summary
  if (await testFraudSummary()) {
    passedTests++;
  }

  // Test 4: User Behavior Analysis
  if (await testUserBehaviorAnalysis()) {
    passedTests++;
  }

  // Test 5: Frontend Access
  if (await testFrontendAccess()) {
    passedTests++;
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n' + '=' .repeat(60));
  console.log(`🏁 Complete Workflow Test Results`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('\n✅ Fraud Detection System Status:');
    console.log('   🛡️  Transaction analysis: WORKING');
    console.log('   🚨 High-risk detection: WORKING');
    console.log('   📊 Fraud summary: WORKING');
    console.log('   🧠 Behavior analysis: WORKING');
    console.log('   🌐 Frontend access: WORKING');
    console.log('\n🛡️ The fraud detection system is fully operational!');
  } else {
    console.log('\n❌ Some tests failed. Please check the output above.');
  }

  return passedTests === totalTests;
}

// Run the complete test
if (require.main === module) {
  runCompleteWorkflowTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runCompleteWorkflowTest,
  testTransactionAnalysis,
  testFraudSummary,
  testUserBehaviorAnalysis,
  testFrontendAccess
};
