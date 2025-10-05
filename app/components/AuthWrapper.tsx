"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify
Amplify.configure(outputs);

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <div>
          <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem',
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '2rem'
          }}>
            <h2>Cancel My Stuff</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Hello, {user?.signInDetails?.loginId || user?.username}</span>
              <button 
                onClick={signOut}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </div>
          </nav>
          {children}
        </div>
      )}
    </Authenticator>
  );
}