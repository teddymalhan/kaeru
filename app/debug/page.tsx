"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import "../app.css";

// Override global body styles for debug page
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    body {
      height: auto !important;
      align-items: flex-start !important;
      justify-content: flex-start !important;
    }
  `;
  document.head.appendChild(style);
}

const client = generateClient<Schema>();

export default function DebugPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'detections' | 'artifacts' | 'lambdas'>('transactions');
  const [transactions, setTransactions] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [detectionItems, setDetectionItems] = useState<Array<Schema["DetectionItem"]["type"]>>([]);
  const [artifacts, setArtifacts] = useState<Array<Schema["Artifact"]["type"]>>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

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

  // Lambda testing state
  const [selectedDetectionItem, setSelectedDetectionItem] = useState<string | null>(null);
  const [actHandlerForm, setActHandlerForm] = useState({
    action: 'cancel',
    detectionItemId: '',
    userId: 'debug-user-123',
    metadata: {
      merchant: 'Netflix',
      amount: 15.99,
      date: new Date().toISOString().split('T')[0],
      accountLast4: '1234'
    }
  });

  const [cancelApiForm, setCancelApiForm] = useState({
    detectionItemId: '',
    userId: 'debug-user-123',
    metadata: {
      merchant: 'Netflix',
      amount: 15.99,
      date: new Date().toISOString().split('T')[0],
      accountLast4: '1234'
    }
  });

  const [actHandlerResponse, setActHandlerResponse] = useState<any>(null);
  const [cancelApiResponse, setCancelApiResponse] = useState<any>(null);
  const [cancelEmailResponse, setCancelEmailResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('Netflix');
  const [selectedBank, setSelectedBank] = useState<string>('TD Bank');

  // cancelEmail form state
  const [cancelEmailForm, setCancelEmailForm] = useState({
    detectionItemId: '',
    userId: 'debug-user-123',
    metadata: {
      merchant: 'Netflix',
      amount: 15.99,
      date: new Date().toISOString().split('T')[0],
      accountLast4: '1234'
    }
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

  // Lambda testing functions
  async function testActHandler() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/actHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actHandlerForm)
      });
      const data = await response.json();
      setActHandlerResponse(data);
    } catch (error) {
      setActHandlerResponse({ error: 'Failed to call actHandler', details: error });
    } finally {
      setIsLoading(false);
    }
  }

  async function testCancelApi() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cancelApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelApiForm)
      });
      const data = await response.json();
      setCancelApiResponse(data);
    } catch (error) {
      setCancelApiResponse({ error: 'Failed to call cancelApi', details: error });
    } finally {
      setIsLoading(false);
    }
  }

  function selectDetectionItemForTesting(item: Schema["DetectionItem"]["type"]) {
    setSelectedDetectionItem(item.id);
    setActHandlerForm(prev => ({ ...prev, detectionItemId: item.id }));
    setCancelApiForm(prev => ({ ...prev, detectionItemId: item.id }));
    setCancelEmailForm(prev => ({ ...prev, detectionItemId: item.id }));
  }

  // cancelEmail testing function
  async function testCancelEmail() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cancelEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelEmailForm)
      });
      const data = await response.json();
      setCancelEmailResponse(data);
    } catch (error) {
      setCancelEmailResponse({ error: 'Failed to call cancelEmail', details: error });
    } finally {
      setIsLoading(false);
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, rgb(117, 81, 194), rgb(255, 255, 255))',
      padding: '0',
      margin: '0',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      overflow: 'auto'
    }}>
      <main style={{ 
        padding: '2rem', 
        marginTop: '6rem',
        maxWidth: '1200px', 
        marginLeft: 'auto',
        marginRight: 'auto',
        minHeight: '100vh',
        background: 'transparent'
      }}>
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
        <button onClick={() => setActiveTab('lambdas')} style={tabStyle(activeTab === 'lambdas')}>
          Lambda Functions
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

      {/* Lambda Functions Tab */}
      {activeTab === 'lambdas' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>⚡ Lambda Functions Testing</h2>
            <p style={{ color: '#6c757d', margin: 0 }}>Test the backend Lambda functions that handle subscription cancellation and dispute workflows</p>
          </div>
          
          {/* Quick Guide */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>🚀</span>
              </div>
              <h3 style={{ margin: 0, color: '#495057' }}>How to Test Lambda Functions</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>1. Select Detection Item</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Choose a subscription from your detection items to test with real data</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>2. Test Action Handler</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Try cancel, dispute, or keep actions to see different workflows</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>3. Test Merchant API</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Simulate API calls to different merchants with realistic success rates</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>4. Test Email Cancellation</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Simulate sending emails when API calls fail</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>5. View Results</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>See detailed responses and understand how the system works</div>
              </div>
            </div>
            
            {/* Workflow Explanation */}
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#fff3cd', 
              borderRadius: '6px', 
              border: '1px solid #ffeaa7' 
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#856404' }}>📋 Workflow: Cancel → API → Email</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎯</span>
                  <span style={{ fontSize: '0.875rem', color: '#856404' }}>Action Handler</span>
                </div>
                <span style={{ fontSize: '1.2rem' }}>→</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🛒</span>
                  <span style={{ fontSize: '0.875rem', color: '#856404' }}>Merchant API</span>
                </div>
                <span style={{ fontSize: '1.2rem' }}>→</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📧</span>
                  <span style={{ fontSize: '0.875rem', color: '#856404' }}>Email Fallback</span>
                </div>
              </div>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', color: '#856404' }}>
                Each step has different success rates. If API fails, email is used as fallback.
              </p>
            </div>
          </div>

          {/* Detection Items Selection */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#28a745',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>📋</span>
              </div>
              <h3 style={{ margin: 0, color: '#495057' }}>Step 1: Choose Subscription to Test</h3>
            </div>
            <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.875rem' }}>
              Select a subscription from your detection items. This will auto-fill the forms below with real data.
            </p>
            
            {detectionItems.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {detectionItems.map((item) => (
                  <div key={item.id} style={{
                    padding: '1rem',
                    backgroundColor: selectedDetectionItem === item.id ? '#e7f3ff' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `2px solid ${selectedDetectionItem === item.id ? '#007bff' : '#dee2e6'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => selectDetectionItemForTesting(item)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                        {item.itemName}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Type: {item.subscriptionType}</span>
                        <span>Status: {item.status}</span>
                        <span>Amount: ${item.detectedAmount}</span>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: selectedDetectionItem === item.id ? '#007bff' : '#6c757d',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {selectedDetectionItem === item.id ? '✓ SELECTED' : 'SELECT'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📝</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>No Detection Items Found</h4>
                <p style={{ margin: '0 0 1rem 0', color: '#6c757d' }}>
                  Create some detection items first to test the Lambda functions with real data.
                </p>
                <button 
                  onClick={() => setActiveTab('detections')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Go to Detection Items
                </button>
              </div>
            )}
          </div>

          {/* actHandler Testing */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#ffc107',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>🎯</span>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#495057' }}>Step 2: Test Action Handler</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.875rem' }}>
                  This Lambda function decides what action to take on a subscription
                </p>
              </div>
            </div>
            
            {/* Action Types */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                🎭 Choose Action Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { value: 'cancel', label: 'Cancel Subscription', description: 'Start cancellation workflow', color: '#dc3545' },
                  { value: 'dispute', label: 'Dispute Transaction', description: 'Start dispute workflow', color: '#fd7e14' },
                  { value: 'keep', label: 'Keep Subscription', description: 'Mark as legitimate', color: '#28a745' },
                  { value: 'mark_legit', label: 'Mark Legitimate', description: 'Confirm it\'s valid', color: '#20c997' }
                ].map(action => (
                  <div 
                    key={action.value}
                    onClick={() => setActHandlerForm({...actHandlerForm, action: action.value})}
                    style={{
                      padding: '1rem',
                      backgroundColor: actHandlerForm.action === action.value ? '#e7f3ff' : '#f8f9fa',
                      borderRadius: '8px',
                      border: `2px solid ${actHandlerForm.action === action.value ? '#007bff' : '#dee2e6'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: action.color,
                      marginBottom: '0.5rem'
                    }}></div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                      {action.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      {action.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📝 Additional Details
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Detection Item ID
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-filled when you select above"
                    value={actHandlerForm.detectionItemId}
                    onChange={(e) => setActHandlerForm({...actHandlerForm, detectionItemId: e.target.value})}
                    style={{...inputStyle, backgroundColor: actHandlerForm.detectionItemId ? '#fff' : '#f8f9fa'}}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="debug-user-123"
                    value={actHandlerForm.userId}
                    onChange={(e) => setActHandlerForm({...actHandlerForm, userId: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Netflix"
                    value={actHandlerForm.metadata.merchant}
                    onChange={(e) => setActHandlerForm({
                      ...actHandlerForm, 
                      metadata: {...actHandlerForm.metadata, merchant: e.target.value}
                    })}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.99"
                    value={actHandlerForm.metadata.amount}
                    onChange={(e) => setActHandlerForm({
                      ...actHandlerForm, 
                      metadata: {...actHandlerForm.metadata, amount: parseFloat(e.target.value)}
                    })}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Account Last 4
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={actHandlerForm.metadata.accountLast4}
                    onChange={(e) => setActHandlerForm({
                      ...actHandlerForm, 
                      metadata: {...actHandlerForm.metadata, accountLast4: e.target.value}
                    })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={testActHandler}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: isLoading ? '#6c757d' : '#ffc107',
                  color: isLoading ? '#ffffff' : '#212529',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? '⏳' : '🚀'} {isLoading ? 'Testing...' : 'Test Action Handler'}
              </button>
              
              {actHandlerResponse && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: actHandlerResponse.success ? '#d4edda' : '#f8d7da',
                  borderRadius: '6px',
                  border: `1px solid ${actHandlerResponse.success ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: actHandlerResponse.success ? '#155724' : '#721c24'
                }}>
                  {actHandlerResponse.success ? '✅ Success' : '❌ Error'}
                </div>
              )}
            </div>
            
            {/* actHandler Response */}
            {actHandlerResponse && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: actHandlerResponse.success ? '#d4edda' : '#f8d7da',
                borderRadius: '8px',
                border: `1px solid ${actHandlerResponse.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: actHandlerResponse.success ? '#28a745' : '#dc3545',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem'
                  }}>
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      {actHandlerResponse.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, color: actHandlerResponse.success ? '#155724' : '#721c24' }}>
                    {actHandlerResponse.success ? 'Action Handler Response' : 'Error Response'}
                  </h4>
                </div>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  margin: 0,
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(actHandlerResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* cancelApi Testing */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#17a2b8',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>🛒</span>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#495057' }}>Step 3: Test Merchant API</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.875rem' }}>
                  This Lambda function simulates API calls to merchant services for cancellation
                </p>
              </div>
            </div>
            
            {/* Merchant Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                🏪 Choose Merchant Service
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { value: 'Netflix', label: 'Netflix', successRate: 90, description: 'Streaming service', color: '#e50914' },
                  { value: 'Spotify', label: 'Spotify', successRate: 85, description: 'Music streaming', color: '#1db954' },
                  { value: 'Amazon Prime', label: 'Amazon Prime', successRate: 70, description: 'E-commerce & streaming', color: '#ff9900' },
                  { value: 'Disney+', label: 'Disney+', successRate: 80, description: 'Disney streaming', color: '#113ccf' },
                  { value: 'Adobe', label: 'Adobe', successRate: 60, description: 'Creative software', color: '#ff0000' },
                  { value: 'Microsoft', label: 'Microsoft', successRate: 65, description: 'Office & cloud', color: '#0078d4' },
                  { value: 'Apple', label: 'Apple', successRate: 80, description: 'Apple services', color: '#007aff' },
                  { value: 'Google', label: 'Google', successRate: 85, description: 'Google services', color: '#4285f4' },
                  { value: 'Unknown', label: 'Unknown Service', successRate: 30, description: 'Unknown merchant', color: '#6c757d' }
                ].map(merchant => (
                  <div 
                    key={merchant.value}
                    onClick={() => setCancelApiForm({
                      ...cancelApiForm, 
                      metadata: {...cancelApiForm.metadata, merchant: merchant.value}
                    })}
                    style={{
                      padding: '1rem',
                      backgroundColor: cancelApiForm.metadata.merchant === merchant.value ? '#e7f3ff' : '#f8f9fa',
                      borderRadius: '8px',
                      border: `2px solid ${cancelApiForm.metadata.merchant === merchant.value ? '#007bff' : '#dee2e6'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: merchant.color
                      }}></div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: merchant.successRate >= 80 ? '#d4edda' : merchant.successRate >= 60 ? '#fff3cd' : '#f8d7da',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: merchant.successRate >= 80 ? '#155724' : merchant.successRate >= 60 ? '#856404' : '#721c24'
                      }}>
                        {merchant.successRate}% success
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                      {merchant.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      {merchant.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📝 Additional Details
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Detection Item ID
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-filled when you select above"
                    value={cancelApiForm.detectionItemId}
                    onChange={(e) => setCancelApiForm({...cancelApiForm, detectionItemId: e.target.value})}
                    style={{...inputStyle, backgroundColor: cancelApiForm.detectionItemId ? '#fff' : '#f8f9fa'}}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="debug-user-123"
                    value={cancelApiForm.userId}
                    onChange={(e) => setCancelApiForm({...cancelApiForm, userId: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.99"
                    value={cancelApiForm.metadata.amount}
                    onChange={(e) => setCancelApiForm({
                      ...cancelApiForm, 
                      metadata: {...cancelApiForm.metadata, amount: parseFloat(e.target.value)}
                    })}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Account Last 4
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={cancelApiForm.metadata.accountLast4}
                    onChange={(e) => setCancelApiForm({
                      ...cancelApiForm, 
                      metadata: {...cancelApiForm.metadata, accountLast4: e.target.value}
                    })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={testCancelApi}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: isLoading ? '#6c757d' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? '⏳' : '🛒'} {isLoading ? 'Testing...' : 'Test Merchant API'}
              </button>
              
              {cancelApiResponse && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: cancelApiResponse.success ? '#d4edda' : '#f8d7da',
                  borderRadius: '6px',
                  border: `1px solid ${cancelApiResponse.success ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: cancelApiResponse.success ? '#155724' : '#721c24'
                }}>
                  {cancelApiResponse.success ? '✅ Success' : '❌ Error'}
                </div>
              )}
            </div>
            
            {/* cancelApi Response */}
            {cancelApiResponse && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: cancelApiResponse.success ? '#d4edda' : '#f8d7da',
                borderRadius: '8px',
                border: `1px solid ${cancelApiResponse.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: cancelApiResponse.success ? '#28a745' : '#dc3545',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem'
                  }}>
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      {cancelApiResponse.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, color: cancelApiResponse.success ? '#155724' : '#721c24' }}>
                    {cancelApiResponse.success ? 'Merchant API Response' : 'Error Response'}
                  </h4>
                </div>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  margin: 0,
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(cancelApiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* cancelEmail Testing */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#6f42c1',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>📧</span>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#495057' }}>Step 4: Test Email Cancellation</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.875rem' }}>
                  This Lambda function simulates sending cancellation emails when API calls fail
                </p>
              </div>
            </div>
            
            {/* Merchant Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📧 Choose Merchant for Email Cancellation
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { value: 'Netflix', label: 'Netflix', successRate: 85, description: 'Streaming service', color: '#e50914' },
                  { value: 'Spotify', label: 'Spotify', successRate: 80, description: 'Music streaming', color: '#1db954' },
                  { value: 'Amazon Prime', label: 'Amazon Prime', successRate: 75, description: 'E-commerce & streaming', color: '#ff9900' },
                  { value: 'Disney+', label: 'Disney+', successRate: 82, description: 'Disney streaming', color: '#113ccf' },
                  { value: 'Adobe', label: 'Adobe', successRate: 70, description: 'Creative software', color: '#ff0000' },
                  { value: 'Microsoft', label: 'Microsoft', successRate: 72, description: 'Office & cloud', color: '#0078d4' },
                  { value: 'Apple', label: 'Apple', successRate: 85, description: 'Apple services', color: '#007aff' },
                  { value: 'Google', label: 'Google', successRate: 88, description: 'Google services', color: '#4285f4' },
                  { value: 'Unknown', label: 'Unknown Service', successRate: 60, description: 'Unknown merchant', color: '#6c757d' }
                ].map(merchant => (
                  <div 
                    key={merchant.value}
                    onClick={() => setCancelEmailForm({
                      ...cancelEmailForm, 
                      metadata: {...cancelEmailForm.metadata, merchant: merchant.value}
                    })}
                    style={{
                      padding: '1rem',
                      backgroundColor: cancelEmailForm.metadata.merchant === merchant.value ? '#e7f3ff' : '#f8f9fa',
                      borderRadius: '8px',
                      border: `2px solid ${cancelEmailForm.metadata.merchant === merchant.value ? '#007bff' : '#dee2e6'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: merchant.color
                      }}></div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: merchant.successRate >= 80 ? '#d4edda' : merchant.successRate >= 70 ? '#fff3cd' : '#f8d7da',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: merchant.successRate >= 80 ? '#155724' : merchant.successRate >= 70 ? '#856404' : '#721c24'
                      }}>
                        {merchant.successRate}% success
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                      {merchant.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      {merchant.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📝 Email Details
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Detection Item ID
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-filled when you select above"
                    value={cancelEmailForm.detectionItemId}
                    onChange={(e) => setCancelEmailForm({...cancelEmailForm, detectionItemId: e.target.value})}
                    style={{...inputStyle, backgroundColor: cancelEmailForm.detectionItemId ? '#fff' : '#f8f9fa'}}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="debug-user-123"
                    value={cancelEmailForm.userId}
                    onChange={(e) => setCancelEmailForm({...cancelEmailForm, userId: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.99"
                    value={cancelEmailForm.metadata.amount}
                    onChange={(e) => setCancelEmailForm({
                      ...cancelEmailForm, 
                      metadata: {...cancelEmailForm.metadata, amount: parseFloat(e.target.value)}
                    })}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                    Account Last 4
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={cancelEmailForm.metadata.accountLast4}
                    onChange={(e) => setCancelEmailForm({
                      ...cancelEmailForm, 
                      metadata: {...cancelEmailForm.metadata, accountLast4: e.target.value}
                    })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={testCancelEmail}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: isLoading ? '#6c757d' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? '⏳' : '📧'} {isLoading ? 'Sending...' : 'Send Cancellation Email'}
              </button>
              
              {cancelEmailResponse && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: cancelEmailResponse.success ? '#d4edda' : '#f8d7da',
                  borderRadius: '6px',
                  border: `1px solid ${cancelEmailResponse.success ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: cancelEmailResponse.success ? '#155724' : '#721c24'
                }}>
                  {cancelEmailResponse.success ? '✅ Email Sent' : '❌ Email Failed'}
                </div>
              )}
            </div>
            
            {/* cancelEmail Response */}
            {cancelEmailResponse && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: cancelEmailResponse.success ? '#d4edda' : '#f8d7da',
                borderRadius: '8px',
                border: `1px solid ${cancelEmailResponse.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: cancelEmailResponse.success ? '#28a745' : '#dc3545',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem'
                  }}>
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      {cancelEmailResponse.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, color: cancelEmailResponse.success ? '#155724' : '#721c24' }}>
                    {cancelEmailResponse.success ? 'Email Cancellation Response' : 'Email Failure Response'}
                  </h4>
                </div>
                
                {/* Email Details Section */}
                {cancelEmailResponse.emailDetails && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', color: '#495057' }}>📧 Email Details</h5>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#6c757d' }}>From:</div>
                        <div style={{ color: '#495057' }}>{cancelEmailResponse.emailDetails.from}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#6c757d' }}>To:</div>
                        <div style={{ color: '#495057' }}>{cancelEmailResponse.emailDetails.to}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#6c757d' }}>Subject:</div>
                        <div style={{ color: '#495057' }}>{cancelEmailResponse.emailDetails.subject}</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#6c757d', marginBottom: '0.5rem' }}>Body:</div>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        color: '#495057',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {cancelEmailResponse.emailDetails.body}
                      </div>
                    </div>
                  </div>
                )}
                
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  margin: 0,
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(cancelEmailResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VAPI Testing Section */}
      {activeTab === 'lambdas' && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#28a745',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.75rem'
            }}>
              <span style={{ color: 'white', fontSize: '16px' }}>🤖</span>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#495057' }}>Step 5: Test VAPI Voice Calls</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.875rem' }}>
                Test Riley's assistant making actual voice calls for cancellation and dispute
              </p>
            </div>
          </div>

          {/* VAPI Cancellation Testing */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#dc3545',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '12px' }}>📞</span>
              </div>
              <h4 style={{ margin: 0, color: '#495057' }}>VAPI Cancellation Call</h4>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📱 Custom Phone Number for Testing (Optional)
              </label>
              <input
                type="text"
                placeholder="+1-XXX-XXX-XXXX (your phone number)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#856404' }}>
                  💡 <strong>Testing Tip:</strong> Enter your phone number above to have Riley call YOU instead of the merchant. 
                  This lets you experience the conversation firsthand without calling real customer service lines.
                </p>
              </div>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                🏪 Choose Merchant for Voice Cancellation
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { value: 'Netflix', label: 'Netflix', phoneNumber: '+1-866-579-7172', successRate: 75, color: '#e50914' },
                  { value: 'Spotify', label: 'Spotify', phoneNumber: '+1-877-778-6087', successRate: 70, color: '#1db954' },
                  { value: 'Amazon Prime', label: 'Amazon Prime', phoneNumber: '+1-888-280-4331', successRate: 65, color: '#ff9900' },
                  { value: 'Disney+', label: 'Disney+', phoneNumber: '+1-888-905-7888', successRate: 70, color: '#113ccf' },
                  { value: 'Adobe', label: 'Adobe', phoneNumber: '+1-800-833-6687', successRate: 55, color: '#ff0000' },
                  { value: 'Microsoft', label: 'Microsoft', phoneNumber: '+1-800-642-7676', successRate: 60, color: '#0078d4' },
                  { value: 'Apple', label: 'Apple', phoneNumber: '+1-800-275-2273', successRate: 80, color: '#000000' },
                  { value: 'Google', label: 'Google', phoneNumber: '+1-650-253-0000', successRate: 65, color: '#4285f4' },
                  { value: 'Unknown Service', label: 'Unknown Service', phoneNumber: '+1-800-000-0000', successRate: 50, color: '#6c757d' }
                ].map(merchant => (
                  <div 
                    key={merchant.value}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '2px solid #dee2e6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: merchant.color
                      }}></div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: merchant.successRate >= 70 ? '#d4edda' : '#fff3cd',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: merchant.successRate >= 70 ? '#155724' : '#856404'
                      }}>
                        {merchant.successRate}% success
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                      {merchant.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      {merchant.phoneNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const response = await fetch('/api/cancelViaVapi', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        detectionItemId: selectedDetectionItem || 'test-123',
                        userId: 'debug-user-123',
                        metadata: {
                          merchant: selectedMerchant || 'Netflix',
                          amount: 15.99,
                          date: new Date().toISOString().split('T')[0],
                          accountLast4: '1234',
                          customPhoneNumber: testPhoneNumber || undefined,
                          customerName: 'Test Customer',
                          subscriptionType: 'monthly',
                          cancellationReason: 'No longer needed'
                        }
                      })
                    });
                    const data = await response.json();
                    setActHandlerResponse(data);
                  } catch (error) {
                    setActHandlerResponse({ error: 'Failed to call VAPI cancelViaVapi', details: error });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: isLoading ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? '⏳' : '🤖'} {isLoading ? 'Calling...' : 'Test VAPI Cancellation'}
              </button>
              
              {actHandlerResponse && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#d4edda',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#155724'
                }}>
                  🤖 Riley's Assistant Ready
                </div>
              )}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeaa7'
            }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Important Note:</h5>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#856404' }}>
                This will make a REAL phone call using Riley's assistant to the selected merchant's support line.
                Make sure you have VAPI credits available and that you want to test with real calls.
              </p>
            </div>
          </div>

          {/* VAPI Dispute Testing */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#fd7e14',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <span style={{ color: 'white', fontSize: '12px' }}>🏦</span>
              </div>
              <h4 style={{ margin: 0, color: '#495057' }}>VAPI Dispute Call</h4>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                📱 Custom Phone Number for Testing (Optional)
              </label>
              <input
                type="text"
                placeholder="+1-XXX-XXX-XXXX (your phone number)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#856404' }}>
                  💡 <strong>Testing Tip:</strong> Enter your phone number above to have Riley call YOU instead of the bank. 
                  This lets you experience the dispute conversation firsthand without calling real bank lines.
                </p>
              </div>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                🏦 Choose Canadian Bank for Voice Dispute
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { value: 'TD Bank', label: 'TD Bank', phoneNumber: '+1-800-387-2828', successRate: 80, color: '#00a651' },
                  { value: 'RBC', label: 'Royal Bank of Canada', phoneNumber: '+1-800-769-2511', successRate: 85, color: '#003478' },
                  { value: 'Scotiabank', label: 'Scotiabank', phoneNumber: '+1-800-472-6842', successRate: 75, color: '#d52b1e' },
                  { value: 'BMO', label: 'Bank of Montreal', phoneNumber: '+1-800-263-2263', successRate: 78, color: '#0074c2' },
                  { value: 'CIBC', label: 'CIBC', phoneNumber: '+1-800-465-2422', successRate: 82, color: '#c8102e' },
                  { value: 'National Bank', label: 'National Bank', phoneNumber: '+1-800-361-5565', successRate: 70, color: '#004d88' },
                  { value: 'HSBC Canada', label: 'HSBC Canada', phoneNumber: '+1-800-663-6060', successRate: 77, color: '#db0032' },
                  { value: 'Desjardins', label: 'Desjardins', phoneNumber: '+1-800-224-7737', successRate: 73, color: '#0066cc' },
                  { value: 'Tangerine', label: 'Tangerine', phoneNumber: '+1-888-464-3232', successRate: 68, color: '#ff6600' }
                ].map(bank => (
                  <div 
                    key={bank.value}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '2px solid #dee2e6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: bank.color
                      }}></div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: bank.successRate >= 75 ? '#d4edda' : '#fff3cd',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: bank.successRate >= 75 ? '#155724' : '#856404'
                      }}>
                        {bank.successRate}% success
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#495057' }}>
                      {bank.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      {bank.phoneNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const response = await fetch('/api/disputeViaVapi', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        detectionItemId: selectedDetectionItem || 'test-456',
                        userId: 'debug-user-123',
                        metadata: {
                          merchant: selectedMerchant || 'Netflix',
                          amount: 15.99,
                          date: new Date().toISOString().split('T')[0],
                          accountLast4: '1234',
                          disputeReason: 'fraud',
                          customPhoneNumber: testPhoneNumber || undefined,
                          bankName: selectedBank || 'TD Bank',
                          customerName: 'Test Customer'
                        }
                      })
                    });
                    const data = await response.json();
                    setCancelEmailResponse(data);
                  } catch (error) {
                    setCancelEmailResponse({ error: 'Failed to call VAPI disputeViaVapi', details: error });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: isLoading ? '#6c757d' : '#fd7e14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? '⏳' : '🏦'} {isLoading ? 'Calling...' : 'Test VAPI Dispute'}
              </button>
              
              <div style={{ marginLeft: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057' }}>
                  🏦 Choose Canadian Bank for Dispute
                </label>
                <select 
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    backgroundColor: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="TD Bank">TD Bank - +1-800-387-2828</option>
                  <option value="RBC">Royal Bank of Canada - +1-800-769-2511</option>
                  <option value="Scotiabank">Scotiabank - +1-800-472-6842</option>
                  <option value="BMO">Bank of Montreal - +1-800-263-2263</option>
                  <option value="CIBC">CIBC - +1-800-465-2422</option>
                  <option value="National Bank">National Bank - +1-800-361-5565</option>
                  <option value="HSBC Canada">HSBC Canada - +1-800-663-6060</option>
                  <option value="Desjardins">Desjardins - +1-800-224-7737</option>
                  <option value="Tangerine">Tangerine - +1-888-464-3232</option>
                </select>
              </div>
              
              {cancelEmailResponse && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#d4edda',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#155724'
                }}>
                  🤖 Riley's Assistant Ready
                </div>
              )}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeaa7'
            }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Important Note:</h5>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#856404' }}>
                This will make a REAL phone call using Riley's assistant to the selected bank's dispute line.
                Make sure you have VAPI credits available and that you want to test with real calls.
              </p>
            </div>
          </div>

          {/* VAPI Status */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #b3d9ff'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#0066cc' }}>🤖 VAPI Configuration Status</h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ minWidth: '120px', fontWeight: 'bold', color: '#6c757d' }}>API Key:</div>
                <div style={{ color: '#28a745' }}>
                  ✅ Configured (Server-side)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ minWidth: '120px', fontWeight: 'bold', color: '#6c757d' }}>Assistant ID:</div>
                <div style={{ color: '#28a745' }}>
                  ✅ Riley's ID Configured (Server-side)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ minWidth: '120px', fontWeight: 'bold', color: '#6c757d' }}>Credits:</div>
                <div style={{ color: '#495057' }}>
                  Check your <a href="https://dashboard.vapi.ai/" target="_blank" style={{ color: '#0066cc' }}>VAPI Dashboard</a> for credit balance
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}