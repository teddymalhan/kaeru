"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
// Note: AI hooks will be available after Amplify AI is fully deployed
// import { createAIHooks } from '@aws-amplify/ui-react-ai';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
// const { useAIGeneration, useAIConversation } = createAIHooks(client);

interface FraudSummary {
  totalTransactions: number;
  totalDetectionItems: number;
  highRiskItems: number;
  mediumRiskItems: number;
  lowRiskItems: number;
  recentHighRiskItems: Array<{
    id: string;
    itemName: string;
    status: string;
    detectedAmount: number;
    notes: string;
  }>;
  lastAnalyzed: string;
}

interface HighRiskTransaction {
  id: string;
  itemName: string;
  status: string;
  detectedAmount: number;
  confidence: number;
  notes: string;
  transactionId: string;
}

export default function FraudDetectionPanel() {
  const [fraudSummary, setFraudSummary] = useState<FraudSummary | null>(null);
  const [highRiskTransactions, setHighRiskTransactions] = useState<HighRiskTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');

  useEffect(() => {
    loadFraudSummary();
    loadHighRiskTransactions();
  }, []);

  const loadFraudSummary = async () => {
    try {
      const response = await fetch('/api/fraud-detection?action=get_fraud_summary');
      const data = await response.json();
      if (data.success) {
        setFraudSummary(data.result);
      }
    } catch (error) {
      console.error('Error loading fraud summary:', error);
    }
  };

  const loadHighRiskTransactions = async () => {
    try {
      const response = await fetch('/api/fraud-detection?action=get_high_risk_transactions');
      const data = await response.json();
      if (data.success) {
        setHighRiskTransactions(data.result);
      }
    } catch (error) {
      console.error('Error loading high-risk transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTransaction = async (transactionId: string) => {
    setAnalyzing(true);
    try {
      // Get transaction data first
      const transaction = await client.models.Transaction.get({ id: transactionId });
      
      if (!transaction.data) {
        alert('Transaction not found');
        return;
      }

      // Use Amplify AI generation hook (temporarily disabled until backend is deployed)
      // const [{ data: analysisResult }, analyzeTransaction] = useAIGeneration('analyzeTransaction');
      
      // Temporarily use API endpoint until AI routes are deployed
      const response = await fetch('/api/fraud-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_transaction',
          transactionId: transaction.data.id,
          userId: 'current-user'
        }),
      });

      const data = await response.json();
      if (data.success) {
        const analysis = data.result.output;
        
        // Show detailed analysis results
        const riskLevel = analysis.riskLevel;
        const confidence = (analysis.confidenceScore * 100).toFixed(1);
        const action = analysis.recommendedAction;
        
        let message = `Transaction Analysis Complete!\n\n`;
        message += `Risk Level: ${riskLevel}\n`;
        message += `Confidence: ${confidence}%\n`;
        message += `Recommended Action: ${action}\n\n`;
        
        if (analysis.fraudIndicators.length > 0) {
          message += `Fraud Indicators:\n${analysis.fraudIndicators.map(indicator => `• ${indicator}`).join('\n')}\n\n`;
        }
        
        if (analysis.suspiciousPatterns.length > 0) {
          message += `Suspicious Patterns:\n${analysis.suspiciousPatterns.map(pattern => `• ${pattern}`).join('\n')}\n\n`;
        }
        
        if (riskLevel === 'HIGH') {
          message += `🚨 This transaction has been flagged as HIGH RISK and will be added to the high-risk transactions list.`;
        } else if (riskLevel === 'MEDIUM') {
          message += `⚠️ This transaction has been flagged as MEDIUM RISK and may require review.`;
        } else {
          message += `✅ This transaction appears to be legitimate.`;
        }
        
        alert(message);
        
        // Refresh the data after analysis to show updated high-risk list
        await loadFraudSummary();
        await loadHighRiskTransactions();
        
        console.log('Transaction analysis completed:', {
          transactionId,
          riskLevel,
          confidence: analysis.confidenceScore,
          action,
          fraudIndicators: analysis.fraudIndicators,
          suspiciousPatterns: analysis.suspiciousPatterns
        });
      } else {
        alert(`Analysis failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      alert('Error analyzing transaction');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeAllTransactions = async () => {
    setAnalyzing(true);
    try {
      // Use the analyze_all_transactions API endpoint for better performance
      const response = await fetch('/api/fraud-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_all_transactions',
          userId: 'current-user'
        }),
      });

      const data = await response.json();
      if (data.success) {
        const result = data.result;
        
        let message = `Bulk Analysis Complete!\n\n`;
        message += `Total Transactions Analyzed: ${result.totalAnalyzed}\n`;
        message += `High Risk Found: ${result.highRiskFound}\n`;
        message += `Medium Risk Found: ${result.mediumRiskFound}\n`;
        message += `Low Risk Found: ${result.lowRiskFound}\n\n`;
        
        if (result.highRiskFound > 0) {
          message += `🚨 ${result.highRiskFound} high-risk transactions have been added to the high-risk list.`;
        } else {
          message += `✅ No high-risk transactions found.`;
        }
        
        alert(message);
        
        // Refresh the data to show updated high-risk list
        await loadFraudSummary();
        await loadHighRiskTransactions();
        
        console.log('Bulk analysis completed:', result);
      } else {
        alert(`Bulk analysis failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error analyzing all transactions:', error);
      alert('Error analyzing transactions');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '✅';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading fraud detection data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>🛡️ Fraud Detection Dashboard</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          AI-powered fraud detection and risk assessment for your transactions.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={analyzeAllTransactions}
          disabled={analyzing}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: analyzing ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {analyzing ? 'Analyzing...' : '🔍 Analyze All Transactions'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Enter Transaction ID"
            value={selectedTransactionId}
            onChange={(e) => setSelectedTransactionId(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={() => selectedTransactionId && analyzeTransaction(selectedTransactionId)}
            disabled={!selectedTransactionId || analyzing}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedTransactionId && !analyzing ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedTransactionId && !analyzing ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem'
            }}
          >
            Analyze
          </button>
          <button
            onClick={() => {
              setSelectedTransactionId('36a0f28b-4727-42bb-812c-16c7086e89c1');
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            title="Use test transaction ID"
          >
            Test ID
          </button>
        </div>
      </div>

      {/* Fraud Summary */}
      {fraudSummary && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>📊 Fraud Detection Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
                {fraudSummary.totalTransactions}
              </div>
              <div style={{ color: '#666' }}>Total Transactions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getRiskColor('high') }}>
                {fraudSummary.highRiskItems}
              </div>
              <div style={{ color: '#666' }}>High Risk</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getRiskColor('medium') }}>
                {fraudSummary.mediumRiskItems}
              </div>
              <div style={{ color: '#666' }}>Medium Risk</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getRiskColor('low') }}>
                {fraudSummary.lowRiskItems}
              </div>
              <div style={{ color: '#666' }}>Low Risk</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Last analyzed: {new Date(fraudSummary.lastAnalyzed).toLocaleString()}
          </div>
        </div>
      )}

      {/* High Risk Transactions */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>🚨 High Risk Transactions</h3>
        {highRiskTransactions.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {highRiskTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #fed7d7',
                  borderLeft: '4px solid #e53e3e'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {getRiskIcon('high')} {transaction.itemName}
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Amount: ${transaction.detectedAmount?.toFixed(2) || 'N/A'} • 
                      Confidence: {(transaction.confidence * 100)?.toFixed(1) || 'N/A'}% • 
                      Status: {transaction.status}
                    </div>
                  </div>
                  <button
                    onClick={() => analyzeTransaction(transaction.transactionId)}
                    disabled={analyzing}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: analyzing ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Re-analyze
                  </button>
                </div>
                {transaction.notes && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
                    backgroundColor: 'white',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <strong>Analysis:</strong> {transaction.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p>No high-risk transactions detected!</p>
            <p>Your transactions appear to be safe.</p>
          </div>
        )}
      </div>

      {/* Recent High Risk Items */}
      {fraudSummary?.recentHighRiskItems && fraudSummary.recentHighRiskItems.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>📋 Recent High Risk Items</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {fraudSummary.recentHighRiskItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#fff5f5',
                  borderRadius: '4px',
                  border: '1px solid #fed7d7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {getRiskIcon('high')} {item.itemName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    ${item.detectedAmount?.toFixed(2) || 'N/A'} • {item.status}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', maxWidth: '300px' }}>
                  {item.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
