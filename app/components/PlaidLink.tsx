"use client";

import { usePlaidLink } from 'react-plaid-link';
import { useState, useCallback } from 'react';

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  onEvent?: (eventName: string, metadata: any) => void;
}

export default function PlaidLink({ onSuccess, onExit, onEvent }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLinkToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-' + Date.now(), // In production, use actual user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating link token:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onPlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      // Exchange public token for access token
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          userId: 'user-' + Date.now(), // In production, use actual user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange token');
      }

      const data = await response.json();
      console.log('Token exchange successful:', data);
      
      // Call the parent's onSuccess callback
      onSuccess(publicToken, metadata);
      
      // Show success message
      alert(`Bank connected successfully! Access token: ${data.access_token.substring(0, 10)}...`);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error exchanging token:', err);
    }
  }, [onSuccess]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onExit,
    onEvent: onEvent,
  };

  const { open, ready } = usePlaidLink(config);

  const handleConnect = () => {
    if (!linkToken) {
      createLinkToken();
    } else {
      open();
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        border: '1px solid #e0e0e0',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Connect Your Bank Account</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
          Connect your bank account to automatically detect subscription transactions and help you cancel unwanted services.
        </p>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            Error: {error}
          </div>
        )}
        
        <button
          onClick={handleConnect}
          disabled={loading || (!ready && !!linkToken)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <span>🔄</span>
              Creating Link...
            </>
          ) : (
            <>
              <span>🏦</span>
              Connect Bank Account
            </>
          )}
        </button>
        
        {linkToken && ready && (
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.8rem', 
            color: '#28a745',
            fontWeight: '500'
          }}>
            ✅ Ready to connect! Click the button above to open Plaid Link.
          </p>
        )}
      </div>
    </div>
  );
}
