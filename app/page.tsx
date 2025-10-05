"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import PlaidLink from "./components/PlaidLink";
import "./../app/app.css";

const client = generateClient<Schema>();

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Array<Schema["DetectionItem"]["type"]>>([]);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);

  function listSubscriptions() {
    client.models.DetectionItem.observeQuery().subscribe({
      next: (data) => setSubscriptions([...data.items]),
    });
  }

  useEffect(() => {
    listSubscriptions();
  }, []);

  const handleBankConnected = (publicToken: string, metadata: any) => {
    console.log('Bank connected successfully:', metadata);
    // Add the bank to our connected banks list
    const bankName = metadata.institution?.name || 'Connected Bank';
    setConnectedBanks(prev => [...prev, bankName]);
  };

  async function createSubscription() {
    const content = window.prompt("What subscription or service do you want to cancel?");
    if (content) {
      // Create a dummy transaction first (required for DetectionItem)
      const transaction = await client.models.Transaction.create({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: `Subscription: ${content}`,
      });

      if (transaction.data) {
        await client.models.DetectionItem.create({
          itemName: content,
          subscriptionType: 'MONTHLY',
          status: 'DETECTED',
          transactionId: transaction.data.id,
        });
      }
    }
  }

  function deleteSubscription(id: string) {
    client.models.DetectionItem.delete({ id });
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Subscriptions to Cancel</h1>
          <Link href="/debug" style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            🔧 Debug Mode
          </Link>
        </div>
        <p>Keep track of services and subscriptions you want to cancel.</p>
      </div>
      
      {/* Bank Connection Section */}
      <PlaidLink onSuccess={handleBankConnected} />
      
      {/* Connected Banks Display */}
      {connectedBanks.length > 0 && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#d4edda',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>Connected Banks</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {connectedBanks.map((bank, index) => (
              <li key={index} style={{ color: '#155724' }}>🏦 {bank}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={createSubscription}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + Add Subscription to Cancel
        </button>
      </div>

      {subscriptions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subscriptions.map((subscription) => (
            <li 
              key={subscription.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div>
                <span>{subscription.itemName}</span>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  {subscription.subscriptionType} • Status: {subscription.status}
                </div>
              </div>
              <button
                onClick={() => deleteSubscription(subscription.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancelled ✓
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <p>No subscriptions to cancel yet!</p>
          <p>Add subscriptions that you want cancelled on time.</p>
        </div>
      )}
    </main>
  );
}
