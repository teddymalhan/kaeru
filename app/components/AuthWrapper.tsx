"use client";

import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify synchronously at module load so UI can use Auth immediately
// Note: relies on tsconfig "resolveJsonModule": true
import amplifyOutputs from "../../amplify_outputs.json";
Amplify.configure((amplifyOutputs as any).default ?? (amplifyOutputs as any));

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Authenticator hideSignUp={true}>
      {() => (
        <div>
          {children}
        </div>
      )}
    </Authenticator>
  );
}