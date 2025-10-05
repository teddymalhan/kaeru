#!/bin/bash

# Setup script for Plaid environment variables
# This script creates a .env.local file with the Plaid credentials

echo "Setting up Plaid environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Plaid Configuration
PLAID_CLIENT_ID=68e1919bb29c1000263002ec
PLAID_SANDBOX=2426d9179d31bc7213942680e161ef
PLAID_ENVIRONMENT=sandbox

# Note: These are your actual Plaid sandbox credentials
# Make sure to keep this file secure and don't commit it to version control
EOF

echo "✅ Created .env.local file with Plaid credentials"
echo "📝 You can now start your Next.js development server with: npm run dev"
echo "🔒 Remember to add .env.local to your .gitignore file"
