#!/bin/bash

# Setup script for Plaid ingestTransactions Lambda function
echo "🚀 Setting up Plaid ingestTransactions Lambda function..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Plaid API Configuration
PLAID_CLIENT_ID=your_plaid_client_id_here
PLAID_SECRET=your_plaid_secret_here  
PLAID_ENVIRONMENT=sandbox
PLAID_WEBHOOK_SECRET=your_webhook_secret_here

# AWS Configuration (if running locally)
AWS_REGION=us-east-1
AWS_PROFILE=default
EOF
    echo "✅ Created .env file. Please update it with your Plaid credentials."
else
    echo "✅ .env file already exists"
fi

# Install dependencies for the Lambda function
echo "📦 Installing Lambda function dependencies..."
cd amplify/functions/ingestTransactions
npm install
cd ../../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Plaid credentials from https://dashboard.plaid.com/team/keys"
echo "2. Deploy your Amplify app: npx ampx sandbox"
echo "3. Get the Function URL from the deployment output"
echo "4. Configure the webhook URL in Plaid Dashboard: https://dashboard.plaid.com/team/webhooks"
echo ""
echo "📚 Documentation: See amplify/functions/ingestTransactions/README.md for detailed setup instructions"