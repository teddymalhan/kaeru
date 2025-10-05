#!/usr/bin/env node

/**
 * Frontend Fraud Detection Test
 * This test verifies that the fraud detection frontend is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

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
          resolve({ status: res.statusCode, data: jsonData, html: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, html: data });
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

async function testFrontendAccess() {
  console.log('🌐 Testing Frontend Access...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      
      const html = response.html;
      
      // Check for key elements
      const hasTitle = html.includes('Cancel My Stuff');
      const hasFraudTab = html.includes('Fraud Detection') || html.includes('fraud-detection');
      const hasSubscriptionsTab = html.includes('Subscriptions');
      const hasAuth = html.includes('Authenticator') || html.includes('Sign in');
      
      console.log(`   Application title found: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   Fraud Detection tab found: ${hasFraudTab ? '✅' : '❌'}`);
      console.log(`   Subscriptions tab found: ${hasSubscriptionsTab ? '✅' : '❌'}`);
      console.log(`   Authentication system found: ${hasAuth ? '✅' : '❌'}`);
      
      // Check for specific fraud detection elements
      if (html.includes('FraudDetectionPanel') || html.includes('fraud-detection')) {
        console.log('   ✅ Fraud detection components found in HTML');
      } else {
        console.log('   ⚠️  Fraud detection components not found in HTML');
      }
      
      return hasTitle && hasFraudTab;
    } else {
      console.log(`❌ Frontend access failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

async function testFraudDetectionAPIFromFrontend() {
  console.log('\n🛡️ Testing Fraud Detection API from Frontend Perspective...');
  
  // Test the endpoints that the frontend would call
  const endpoints = [
    { action: 'get_fraud_summary', description: 'Fraud Summary' },
    { action: 'get_high_risk_transactions', description: 'High Risk Transactions' }
  ];
  
  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    console.log(`\n  📊 Testing ${endpoint.description}...`);
    
    try {
      const response = await makeRequest(`${BASE_URL}/api/fraud-detection?action=${endpoint.action}`);
      
      if (response.status === 200 && response.data.success) {
        console.log(`  ✅ ${endpoint.description} endpoint working`);
        
        if (endpoint.action === 'get_fraud_summary') {
          const summary = response.data.result;
          console.log(`     Total transactions: ${summary.totalTransactions}`);
          console.log(`     High risk items: ${summary.highRiskItems}`);
          console.log(`     Medium risk items: ${summary.mediumRiskItems}`);
          console.log(`     Low risk items: ${summary.lowRiskItems}`);
        } else if (endpoint.action === 'get_high_risk_transactions') {
          const transactions = response.data.result;
          console.log(`     High risk transactions found: ${transactions.length}`);
        }
        
        passedTests++;
      } else {
        console.log(`  ❌ ${endpoint.description} endpoint failed`);
        console.log(`     Status: ${response.status}`);
        console.log(`     Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint.description} test failed: ${error.message}`);
    }
  }
  
  console.log(`\n  📈 API Tests Results: ${passedTests}/${endpoints.length} tests passed`);
  return passedTests === endpoints.length;
}

async function testTransactionAnalysisFromFrontend() {
  console.log('\n🔍 Testing Transaction Analysis from Frontend...');
  
  // Test a suspicious transaction that the frontend might analyze
  const suspiciousTransaction = {
    action: 'analyze_transaction',
    transactionId: 'frontend-test-001',
    amount: 1000,
    description: 'ALERT: FREE BEER FREE',
    merchant: 'ScamCompany101',
    category: 'Service',
    userId: 'frontend-user'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/fraud-detection`, {
      method: 'POST',
      body: suspiciousTransaction
    });
    
    if (response.status === 200 && response.data.success) {
      const analysis = response.data.result.output;
      console.log('  ✅ Transaction analysis working from frontend');
      console.log(`     Risk Level: ${analysis.riskLevel}`);
      console.log(`     Confidence: ${(analysis.confidenceScore * 100).toFixed(1)}%`);
      console.log(`     Action: ${analysis.recommendedAction}`);
      console.log(`     Indicators: ${analysis.fraudIndicators.length}`);
      
      if (analysis.riskLevel === 'HIGH') {
        console.log('  ✅ Suspicious transaction correctly flagged as HIGH risk');
        return true;
      } else {
        console.log(`  ❌ Expected HIGH risk, got ${analysis.riskLevel}`);
        return false;
      }
    } else {
      console.log('  ❌ Transaction analysis failed');
      console.log(`     Status: ${response.status}`);
      console.log(`     Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Test failed: ${error.message}`);
    return false;
  }
}

async function runFrontendFraudTest() {
  console.log('🚀 Starting Frontend Fraud Detection Test');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 3;

  // Test 1: Frontend Access
  if (await testFrontendAccess()) {
    passedTests++;
  }

  // Test 2: Fraud Detection API from Frontend
  if (await testFraudDetectionAPIFromFrontend()) {
    passedTests++;
  }

  // Test 3: Transaction Analysis from Frontend
  if (await testTransactionAnalysisFromFrontend()) {
    passedTests++;
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n' + '=' .repeat(50));
  console.log(`🏁 Frontend Fraud Detection Test Results`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL FRONTEND TESTS PASSED! 🎉');
    console.log('\n✅ Frontend Fraud Detection Status:');
    console.log('   🌐 Frontend access: WORKING');
    console.log('   🛡️  API endpoints: WORKING');
    console.log('   🔍 Transaction analysis: WORKING');
    console.log('\n💡 To test the UI:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Sign in with your credentials');
    console.log('   3. Click on the "🛡️ Fraud Detection" tab');
    console.log('   4. The fraud detection panel should load with data');
  } else {
    console.log('\n❌ Some frontend tests failed. Please check the output above.');
  }

  return passedTests === totalTests;
}

// Run the test
if (require.main === module) {
  runFrontendFraudTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Frontend test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runFrontendFraudTest,
  testFrontendAccess,
  testFraudDetectionAPIFromFrontend,
  testTransactionAnalysisFromFrontend
};
