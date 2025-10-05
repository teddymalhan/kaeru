"use client";

import { usePlaidLink } from 'react-plaid-link';
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { setPlaidConnection } from "../lib/plaid-store";
import { getPlaidConnection, clearPlaidConnection } from "../lib/plaid-store";

interface PlaidLinkProps {
  onSuccess?: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  onEvent?: (eventName: string, metadata: any) => void;
}

export default function PlaidLink({ onSuccess, onExit, onEvent }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState(() => getPlaidConnection());

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
          userId: 'user-' + Date.now(),
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
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          userId: 'user-' + Date.now(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange token');
      }
      const data = await response.json();
      console.log('Token exchange successful:', data);
      if (data?.access_token && data?.item_id) {
        setPlaidConnection({ accessToken: data.access_token, itemId: data.item_id, connectedAt: Date.now() });
        setConnection(getPlaidConnection());
      }
      if (onSuccess) onSuccess(publicToken, metadata);
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

  // Auto-open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  // Keep connection state in sync across tabs
  useEffect(() => {
    const onSync = () => setConnection(getPlaidConnection());
    window.addEventListener("cms:plaid", onSync);
    return () => window.removeEventListener("cms:plaid", onSync);
  }, []);

  const handleConnect = () => {
    if (!linkToken) {
      createLinkToken();
    } else {
      open();
    }
  };

  const handleDisconnect = () => {
    clearPlaidConnection();
    setConnection(null);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('Clipboard unavailable');
    }
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-background/95">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {connection ? 'Bank account connected' : 'Connect your bank'}
        </CardTitle>
        <CardDescription>
          {connection
            ? 'Your account is linked. We will use transactions to detect subscriptions.'
            : 'Link an account to detect subscription transactions and help cancel unwanted services.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Error: {error}
          </div>
        )}

        {!connection && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {linkToken && ready ? 'Ready to open Plaid Link.' : 'Create a secure link token to begin.'}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleConnect} disabled={loading || (!ready && !!linkToken)} className="rounded-full px-5">
                {loading ? 'Creating Link…' : (linkToken ? 'Open Plaid Link' : 'Connect Bank Account')}
              </Button>
            </div>
          </div>
        )}

        {connection && (
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connection details</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="text-sm">
                <div className="text-muted-foreground">Item ID</div>
                <div className="font-mono">{connection.itemId}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Access Token</div>
                <div className="font-mono">{`${connection.accessToken.substring(0, 8)}••••••••`}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        {!connection && linkToken && ready && (
          <span className="text-xs font-medium text-primary">Ready to connect — click Open Plaid Link.</span>
        )}
        {connection && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
