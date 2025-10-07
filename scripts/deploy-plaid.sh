#!/bin/bash

# Deploy Plaid ingestTransactions Lambda and get webhook URL
echo "🚀 Deploying Plaid ingestTransactions Lambda function..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required environment variables are set
if [ -z "$PLAID_ENVIRONMENT" ]; then
    export PLAID_ENVIRONMENT=sandbox
    print_warning "PLAID_ENVIRONMENT not set, defaulting to 'sandbox'"
fi

print_info "Using Plaid environment: $PLAID_ENVIRONMENT"

# Check if secrets are configured
print_info "Checking if Plaid secrets are configured..."

# Set secrets if not already configured
echo ""
echo "Setting up Plaid secrets..."
echo "You'll need your Plaid credentials from: https://dashboard.plaid.com/team/keys"
echo ""

echo "Setting PLAID_CLIENT_ID..."
npx ampx sandbox secret set PLAID_CLIENT_ID

echo ""
echo "Setting PLAID_SECRET..."
npx ampx sandbox secret set PLAID_SECRET

echo ""
echo "Setting PLAID_WEBHOOK_SECRET (optional, press Enter to skip)..."
npx ampx sandbox secret set PLAID_WEBHOOK_SECRET || echo "Skipped webhook secret"

print_status "Secrets configured successfully!"

# Deploy the Amplify app
echo ""
print_info "Deploying Amplify application..."
npx ampx sandbox

# Check deployment status
if [ $? -eq 0 ]; then
    print_status "Deployment successful!"
    
    echo ""
    print_info "🎯 Next steps:"
    echo "1. Copy the Function URL from the deployment output above"
    echo "2. Go to Plaid Dashboard: https://dashboard.plaid.com/team/webhooks"
    echo "3. Add your Function URL as a webhook endpoint"
    echo "4. Select webhook types: SYNC_UPDATES_AVAILABLE, INITIAL_UPDATE, HISTORICAL_UPDATE"
    echo ""
    
    print_info "📋 The webhook URL format will be:"
    echo "   https://[unique-id].lambda-url.[region].on.aws/"
    echo ""
    
    print_info "📚 Documentation:"
    echo "   • Complete setup guide: ./PLAID_SETUP.md"
    echo "   • Function documentation: ./amplify/functions/ingestTransactions/README.md"
    echo ""
    
    print_info "🧪 Test your webhook:"
    echo "   Use the test payload in: ./amplify/functions/ingestTransactions/test-data.ts"
    
else
    print_error "Deployment failed!"
    echo "Check the error messages above and try again."
    exit 1
fi

echo ""
print_status "Setup complete! 🎉"