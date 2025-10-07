#!/bin/bash

# Setup script for Plaid environment variables
# This script creates a .env.local file with the Plaid credentials

echo "Setting up Plaid environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Plaid Configuration
PLAID_CLIENT_ID=dummy_plaid_client_id
PLAID_SANDBOX=dummy_plaid_secret
PLAID_ENVIRONMENT=sandbox

# Note: These are dummy Plaid credentials for development
# Replace with your actual Plaid sandbox credentials from https://dashboard.plaid.com/team/keys
# Make sure to keep actual credentials secure and don't commit them to version control
EOF

echo "✅ Created .env.local file with Plaid credentials"
echo "📝 You can now start your Next.js development server with: npm run dev"
echo "🔒 Remember to add .env.local to your .gitignore file"
