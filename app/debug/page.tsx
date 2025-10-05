"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import "./../../app/app.css";

const client = generateClient<Schema>();

export default function DebugPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'detections' | 'artifacts' | 'ingestion'>('transactions');
  const [transactions, setTransactions] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [detectionItems, setDetectionItems] = useState<Array<Schema["DetectionItem"]["type"]>>([]);
  const [artifacts, setArtifacts] = useState<Array<Schema["Artifact"]["type"]>>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  // Data Ingestion state
  const [webhookResponse, setWebhookResponse] = useState<string>('');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedWebhookType, setSelectedWebhookType] = useState<'sync' | 'initial' | 'historical'>('sync');
  const [customItemId, setCustomItemId] = useState('test_item_123');

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    date: '',
    description: '',
    merchant: '',
    category: ''
  });

  // DetectionItem form state  
  const [detectionForm, setDetectionForm] = useState({
    itemName: '',
    subscriptionType: 'MONTHLY' as const,
    status: 'DETECTED' as const,
    detectedAmount: '',
    confidence: '',
    transactionId: ''
  });

  // Artifact form state
  const [artifactForm, setArtifactForm] = useState({
    filePath: '',
    contentType: '',
    fileSize: '',
    artifactType: 'SCREENSHOT' as const,
    transactionId: '',
    detectionItemId: ''
  });

  // Load data
  useEffect(() => {
    loadTransactions();
    loadDetectionItems();
    loadArtifacts();
  }, []);

  function loadTransactions() {
    client.models.Transaction.observeQuery().subscribe({
      next: (data) => setTransactions([...data.items]),
    });
  }

  function loadDetectionItems() {
    client.models.DetectionItem.observeQuery().subscribe({
      next: (data) => setDetectionItems([...data.items]),
    });
  }

  function loadArtifacts() {
    client.models.Artifact.observeQuery().subscribe({
      next: (data) => setArtifacts([...data.items]),
    });
  }

  // Transaction CRUD
  async function createTransaction() {
    if (!transactionForm.amount || !transactionForm.date || !transactionForm.description) {
      alert('Please fill in required fields: amount, date, description');
      return;
    }

    await client.models.Transaction.create({
      amount: parseFloat(transactionForm.amount),
      date: transactionForm.date,
      description: transactionForm.description,
      merchant: transactionForm.merchant || null,
      category: transactionForm.category || null,
    });

    // Reset form
    setTransactionForm({
      amount: '',
      date: '',
      description: '',
      merchant: '',
      category: ''
    });
  }

  async function deleteTransaction(id: string) {
    await client.models.Transaction.delete({ id });
  }

  // DetectionItem CRUD
  async function createDetectionItem() {
    if (!detectionForm.itemName || !detectionForm.transactionId) {
      alert('Please fill in required fields: item name and transaction');
      return;
    }

    await client.models.DetectionItem.create({
      itemName: detectionForm.itemName,
      subscriptionType: detectionForm.subscriptionType,
      status: detectionForm.status,
      detectedAmount: detectionForm.detectedAmount ? parseFloat(detectionForm.detectedAmount) : null,
      confidence: detectionForm.confidence ? parseFloat(detectionForm.confidence) : null,
      transactionId: detectionForm.transactionId,
    });

    // Reset form
    setDetectionForm({
      itemName: '',
      subscriptionType: 'MONTHLY',
      status: 'DETECTED',
      detectedAmount: '',
      confidence: '',
      transactionId: ''
    });
  }

  async function deleteDetectionItem(id: string) {
    await client.models.DetectionItem.delete({ id });
  }

  // Artifact CRUD
  async function createArtifact() {
    if (!artifactForm.filePath || !artifactForm.contentType) {
      alert('Please fill in required fields: file path and content type');
      return;
    }

    await client.models.Artifact.create({
      filePath: artifactForm.filePath,
      contentType: artifactForm.contentType,
      fileSize: artifactForm.fileSize ? parseInt(artifactForm.fileSize) : null,
      artifactType: artifactForm.artifactType,
      transactionId: artifactForm.transactionId || null,
      detectionItemId: artifactForm.detectionItemId || null,
      metadata: {
        originalFileName: artifactForm.filePath.split('/').pop() || '',
        uploadedAt: new Date().toISOString(),
        tags: []
      }
    });

    // Reset form
    setArtifactForm({
      filePath: '',
      contentType: '',
      fileSize: '',
      artifactType: 'SCREENSHOT',
      transactionId: '',
      detectionItemId: ''
    });
  }

  async function deleteArtifact(id: string) {
    await client.models.Artifact.delete({ id });
  }

  // Data Ingestion functions
  const getSampleWebhookPayloads = () => ({
    sync: {
      webhook_type: "TRANSACTIONS",
      webhook_code: "SYNC_UPDATES_AVAILABLE", 
      item_id: customItemId,
      initial_update_complete: true,
      historical_update_complete: false,
      environment: "sandbox"
    },
    initial: {
      webhook_type: "TRANSACTIONS", 
      webhook_code: "INITIAL_UPDATE",
      item_id: customItemId,
      error: null,
      new_transactions: 25,
      environment: "sandbox"
    },
    historical: {
      webhook_type: "TRANSACTIONS",
      webhook_code: "HISTORICAL_UPDATE", 
      item_id: customItemId,
      error: null,
      new_transactions: 1500,
      environment: "sandbox"
    }
  });

  async function loadWebhookUrlFromOutputs() {
    try {
      setWebhookLoading(true);
      setWebhookResponse('Attempting to load webhook URL from Amplify outputs...');
      
      // Try to load from amplify_outputs.json
      const response = await fetch('/amplify_outputs.json');
      if (response.ok) {
        const outputs = await response.json();
        const webhookUrl = outputs?.custom?.ingestTransactionsWebhookUrl;
        
        if (webhookUrl) {
          setWebhookUrl(webhookUrl);
          setWebhookResponse(`✅ Loaded webhook URL: ${webhookUrl}`);
        } else {
          setWebhookResponse('⚠️ Webhook URL not found in amplify_outputs.json. You may need to redeploy or check your backend configuration.');
        }
      } else {
        setWebhookResponse('⚠️ Could not load amplify_outputs.json. File may not exist or be accessible.');
      }
    } catch (error: any) {
      setWebhookResponse(`❌ Error loading webhook URL: ${error.message}`);
    } finally {
      setWebhookLoading(false);
    }
  }

  async function testWebhookEndpoint() {
    if (!webhookUrl) {
      setWebhookResponse('Please enter a webhook URL first');
      return;
    }

    setWebhookLoading(true);
    setWebhookResponse('Sending webhook request...');

    try {
      const payload = getSampleWebhookPayloads()[selectedWebhookType];
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'plaid-verification': 'test_signature'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      const status = response.status;
      
      setWebhookResponse(`
Status: ${status} ${response.statusText}
Response: ${responseText}

Sent Payload:
${JSON.stringify(payload, null, 2)}
      `.trim());
      
    } catch (error: any) {
      setWebhookResponse(`Error: ${error.message}`);
    } finally {
      setWebhookLoading(false);
    }
  }

  async function testEndpointHealth() {
    if (!webhookUrl) {
      setWebhookResponse('Please enter a webhook URL first');
      return;
    }

    setWebhookLoading(true);
    setWebhookResponse('Checking endpoint health...');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'health_check' })
      });

      const responseText = await response.text();
      
      setWebhookResponse(`
Health Check Results:
Status: ${response.status} ${response.statusText}
Response: ${responseText}
Endpoint is ${response.status < 500 ? 'responding' : 'having issues'}
      `.trim());
      
    } catch (error: any) {
      setWebhookResponse(`Health Check Failed: ${error.message}`);
    } finally {
      setWebhookLoading(false);
    }
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    marginRight: '0.25rem'
  });

  const formStyle = {
    display: 'grid',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  };

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Cancel My Stuff - Data Models Debug</h1>
          <Link href="/" style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            ← Back to Main App
          </Link>
        </div>
        <p>Test CRUD operations for Transaction, DetectionItem, and Artifact models.</p>
        
        {/* Quick Start Guide */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          marginTop: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🚀 Quick Test Guide:</h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Start by creating a <strong>Transaction</strong> (e.g., $9.99 Netflix payment)</li>
            <li>Create a <strong>Detection Item</strong> linked to that transaction (e.g., Netflix subscription detected)</li>
            <li>Create an <strong>Artifact</strong> linked to either (e.g., screenshot of cancellation page)</li>
            <li>Use "View Details" on transactions to see the relationships in action!</li>
            <li><strong>NEW:</strong> Test the <strong>Data Ingestion</strong> tab to simulate Plaid webhook processing</li>
          </ol>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          marginTop: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>👤 User Ownership:</h4>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            All data is automatically linked to your authenticated user account. You can only see and modify your own transactions, 
            detection items, and artifacts. This is handled automatically by Amplify's <code>allow.owner()</code> authorization rule.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #dee2e6' }}>
        <button onClick={() => setActiveTab('transactions')} style={tabStyle(activeTab === 'transactions')}>
          Transactions ({transactions.length})
        </button>
        <button onClick={() => setActiveTab('detections')} style={tabStyle(activeTab === 'detections')}>
          Detection Items ({detectionItems.length})
        </button>
        <button onClick={() => setActiveTab('artifacts')} style={tabStyle(activeTab === 'artifacts')}>
          Artifacts ({artifacts.length})
        </button>
        <button onClick={() => setActiveTab('ingestion')} style={tabStyle(activeTab === 'ingestion')}>
          📥 Data Ingestion
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <h2>💳 Transactions</h2>
          
          {/* Transaction Form */}
          <div style={formStyle}>
            <h3>Add New Transaction</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input
                type="number"
                step="0.01"
                placeholder="Amount *"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                style={inputStyle}
              />
              <input
                type="date"
                placeholder="Date *"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Description *"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Merchant"
                value={transactionForm.merchant}
                onChange={(e) => setTransactionForm({...transactionForm, merchant: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Category"
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                style={inputStyle}
              />
            </div>
            <button onClick={createTransaction} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add Transaction
            </button>
          </div>

          {/* Transactions List */}
          <div>
            {transactions.map((transaction) => (
              <div key={transaction.id} style={{
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>${transaction.amount}</strong> - {transaction.description}
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {transaction.date} • {transaction.merchant} • {transaction.category}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: selectedTransaction === transaction.id ? '#28a745' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedTransaction === transaction.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Relationship Viewer */}
          {selectedTransaction && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#e7f3ff',
              borderRadius: '4px',
              border: '1px solid #b3d9ff'
            }}>
              <h3>🔗 Related Data for Selected Transaction</h3>
              
              {/* Related Detection Items */}
              <div style={{ marginBottom: '1rem' }}>
                <h4>Detection Items:</h4>
                {detectionItems.filter(d => d.transactionId === selectedTransaction).length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {detectionItems.filter(d => d.transactionId === selectedTransaction).map(item => (
                      <li key={item.id} style={{
                        padding: '0.5rem',
                        margin: '0.25rem 0',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}>
                        <strong>{item.itemName}</strong> ({item.subscriptionType}) - {item.status}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No detection items linked to this transaction</p>
                )}
              </div>

              {/* Related Artifacts */}
              <div>
                <h4>Artifacts:</h4>
                {artifacts.filter(a => a.transactionId === selectedTransaction).length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {artifacts.filter(a => a.transactionId === selectedTransaction).map(artifact => (
                      <li key={artifact.id} style={{
                        padding: '0.5rem',
                        margin: '0.25rem 0',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}>
                        <strong>{artifact.filePath}</strong> ({artifact.artifactType})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No artifacts linked to this transaction</p>
                )}
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
                <h5>💡 Testing Relationships:</h5>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  • Create detection items and link them to this transaction using the dropdown
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  • Create artifacts and link them to this transaction or its detection items
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  • This demonstrates the hasMany/belongsTo relationships in action!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detection Items Tab */}
      {activeTab === 'detections' && (
        <div>
          <h2>🔍 Detection Items</h2>
          
          {/* Detection Form */}
          <div style={formStyle}>
            <h3>Add New Detection Item</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Item Name *"
                value={detectionForm.itemName}
                onChange={(e) => setDetectionForm({...detectionForm, itemName: e.target.value})}
                style={inputStyle}
              />
              <select
                value={detectionForm.subscriptionType}
                onChange={(e) => setDetectionForm({...detectionForm, subscriptionType: e.target.value as any})}
                style={inputStyle}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
                <option value="WEEKLY">Weekly</option>
                <option value="ONE_TIME">One Time</option>
              </select>
              <select
                value={detectionForm.status}
                onChange={(e) => setDetectionForm({...detectionForm, status: e.target.value as any})}
                style={inputStyle}
              >
                <option value="DETECTED">Detected</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="IGNORED">Ignored</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Detected Amount"
                value={detectionForm.detectedAmount}
                onChange={(e) => setDetectionForm({...detectionForm, detectedAmount: e.target.value})}
                style={inputStyle}
              />
              <input
                type="number"
                step="0.01"
                max="1"
                min="0"
                placeholder="Confidence (0-1)"
                value={detectionForm.confidence}
                onChange={(e) => setDetectionForm({...detectionForm, confidence: e.target.value})}
                style={inputStyle}
              />
              <select
                value={detectionForm.transactionId}
                onChange={(e) => setDetectionForm({...detectionForm, transactionId: e.target.value})}
                style={inputStyle}
              >
                <option value="">Select Transaction *</option>
                {transactions.map(t => (
                  <option key={t.id} value={t.id}>
                    ${t.amount} - {t.description}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={createDetectionItem} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add Detection Item
            </button>
          </div>

          {/* Detection Items List */}
          <div>
            {detectionItems.map((item) => (
              <div key={item.id} style={{
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{item.itemName}</strong> - {item.subscriptionType}
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Status: {item.status} • Amount: ${item.detectedAmount} • Confidence: {item.confidence}
                  </div>
                </div>
                <button
                  onClick={() => deleteDetectionItem(item.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts Tab */}
      {activeTab === 'artifacts' && (
        <div>
          <h2>📄 Artifacts</h2>
          
          {/* Artifact Form */}
          <div style={formStyle}>
            <h3>Add New Artifact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input
                type="text"
                placeholder="File Path *"
                value={artifactForm.filePath}
                onChange={(e) => setArtifactForm({...artifactForm, filePath: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Content Type *"
                value={artifactForm.contentType}
                onChange={(e) => setArtifactForm({...artifactForm, contentType: e.target.value})}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="File Size (bytes)"
                value={artifactForm.fileSize}
                onChange={(e) => setArtifactForm({...artifactForm, fileSize: e.target.value})}
                style={inputStyle}
              />
              <select
                value={artifactForm.artifactType}
                onChange={(e) => setArtifactForm({...artifactForm, artifactType: e.target.value as any})}
                style={inputStyle}
              >
                <option value="SCREENSHOT">Screenshot</option>
                <option value="DOCUMENT">Document</option>
                <option value="RECEIPT">Receipt</option>
                <option value="EMAIL">Email</option>
                <option value="OTHER">Other</option>
              </select>
              <select
                value={artifactForm.transactionId}
                onChange={(e) => setArtifactForm({...artifactForm, transactionId: e.target.value})}
                style={inputStyle}
              >
                <option value="">Link to Transaction (optional)</option>
                {transactions.map(t => (
                  <option key={t.id} value={t.id}>
                    ${t.amount} - {t.description}
                  </option>
                ))}
              </select>
              <select
                value={artifactForm.detectionItemId}
                onChange={(e) => setArtifactForm({...artifactForm, detectionItemId: e.target.value})}
                style={inputStyle}
              >
                <option value="">Link to Detection Item (optional)</option>
                {detectionItems.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.itemName}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={createArtifact} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add Artifact
            </button>
          </div>

          {/* Artifacts List */}
          <div>
            {artifacts.map((artifact) => (
              <div key={artifact.id} style={{
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{artifact.filePath}</strong> - {artifact.artifactType}
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Type: {artifact.contentType} • Size: {artifact.fileSize} bytes
                  </div>
                </div>
                <button
                  onClick={() => deleteArtifact(artifact.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Ingestion Tab */}
      {activeTab === 'ingestion' && (
        <div>
          <h2>📥 Data Ingestion Testing</h2>
          <p>Test the transaction ingestion pipeline and webhook endpoints.</p>
          
          {/* Webhook URL Configuration */}
          <div style={formStyle}>
            <h3>Webhook Endpoint Configuration</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Webhook URL:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  placeholder="Enter your ingestTransactions webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    ...inputStyle,
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={loadWebhookUrlFromOutputs}
                  disabled={webhookLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: webhookLoading ? 'not-allowed' : 'pointer',
                    opacity: webhookLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Auto-Load
                </button>
              </div>
              <small style={{ color: '#6c757d', fontSize: '0.875rem', display: 'block' }}>
                Click "Auto-Load" to get URL from amplify_outputs.json, or paste manually. Format: https://[function-url].lambda-url.[region].on.aws/
              </small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Custom Item ID (for testing):
              </label>
              <input
                type="text"
                placeholder="test_item_123"
                value={customItemId}
                onChange={(e) => setCustomItemId(e.target.value)}
                style={inputStyle}
              />
              <small style={{ color: '#6c757d', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                This ID will be used in webhook payloads. Use different IDs to test different scenarios.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={testEndpointHealth}
                disabled={webhookLoading || !webhookUrl}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: webhookLoading || !webhookUrl ? 'not-allowed' : 'pointer',
                  opacity: webhookLoading || !webhookUrl ? 0.6 : 1
                }}
              >
                {webhookLoading ? 'Testing...' : 'Test Health'}
              </button>
            </div>
          </div>

          {/* Webhook Testing */}
          <div style={formStyle}>
            <h3>Send Test Webhook</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Webhook Type:
              </label>
              <select
                value={selectedWebhookType}
                onChange={(e) => setSelectedWebhookType(e.target.value as any)}
                style={inputStyle}
              >
                <option value="sync">SYNC_UPDATES_AVAILABLE (Most Common)</option>
                <option value="initial">INITIAL_UPDATE (First 30 days)</option>
                <option value="historical">HISTORICAL_UPDATE (Full history)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Preview Payload:</h4>
              <pre style={{ 
                margin: 0, 
                fontSize: '0.8rem', 
                overflow: 'auto',
                backgroundColor: '#ffffff',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                {JSON.stringify(getSampleWebhookPayloads()[selectedWebhookType], null, 2)}
              </pre>
            </div>

            <button
              onClick={testWebhookEndpoint}
              disabled={webhookLoading || !webhookUrl}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: webhookLoading || !webhookUrl ? 'not-allowed' : 'pointer',
                opacity: webhookLoading || !webhookUrl ? 0.6 : 1
              }}
            >
              {webhookLoading ? 'Sending...' : 'Send Webhook'}
            </button>
          </div>

          {/* Response Display */}
          {webhookResponse && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <h3>Response</h3>
              <pre style={{
                margin: 0,
                fontSize: '0.875rem',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {webhookResponse}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            <h3>🔧 How to Test Data Ingestion:</h3>
            <ol style={{ marginLeft: '1.5rem' }}>
              <li><strong>Get Webhook URL:</strong> Find your function URL in the Amplify outputs or AWS Console</li>
              <li><strong>Test Health:</strong> Click "Test Health" to verify the endpoint is responding</li>
              <li><strong>Send Webhook:</strong> Choose a webhook type and send a test payload</li>
              <li><strong>Check Response:</strong> Review the response to see if the function processed correctly</li>
              <li><strong>Verify Data:</strong> Check the Transactions tab to see if any new data appeared</li>
            </ol>
            
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>⚠️ Important Notes:</h4>
              <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                <li>The function requires proper Plaid credentials to work fully</li>
                <li>Without a real access token, it will return configuration errors</li>
                <li>This testing interface helps verify webhook processing and error handling</li>
                <li>Real transaction data requires actual Plaid integration setup</li>
              </ul>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>🚀 Quick Test Scenarios:</h4>
              <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                <li><strong>Basic Health Check:</strong> Test endpoint responsiveness without valid payload</li>
                <li><strong>SYNC_UPDATES_AVAILABLE:</strong> Most common webhook - tests transaction sync processing</li>
                <li><strong>INITIAL_UPDATE:</strong> Tests handling of first 30 days of transaction history</li>
                <li><strong>HISTORICAL_UPDATE:</strong> Tests processing of full transaction history</li>
                <li><strong>Different Item IDs:</strong> Change the item ID to test different user scenarios</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}