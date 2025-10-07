<p align="center">
<img width="128" height="128" src="public/kaeru-icon.svg" alt="Kaeru - Return, restore, and reclaim your finances">
</p>

<p align="center">
<strong>Return, rest帰るore, and reclaim your finances with AI-powered automation</strong>
</p>

# Kaeru
> 帰る (kaeru) - to return, go back, or restore

An AI-powered financial operations platform for managing cancellations, disputes, and customer outreach.

Streamline your financial workflows with intelligent automation, real-time fraud detection, and comprehensive transaction management from a single dashboard.

## Features

- **AI Financial Operations**: Automated cancellation workflows, dispute management, and customer outreach
- **Real-time Fraud Detection**: Advanced AI-powered transaction monitoring with risk scoring
- **Transaction Management**: Comprehensive view of all financial activities with export capabilities
- **Subscription Control**: Easy cancellation of recurring subscriptions and billing management
- **Agent Dashboard**: Live status monitoring of AI agents and workflow progress
- **Activity Tracking**: Complete audit trail of all operations and outcomes

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/kaeru.git
cd kaeru

# Install dependencies
npm install

# Set up AWS Amplify (optional)
npx ampx sandbox

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## Core Workflows

### Cancellation Management
- **API-based Cancellations**: Direct integration with service providers
- **Phone Call Automation**: AI agents handle outbound cancellation calls
- **Email Workflows**: Automated cancellation requests via email

### Dispute Resolution
- **Transaction Disputes**: File disputes directly from transaction history
- **Fraud Alerts**: Automated detection and dispute filing for suspicious activity
- **Status Tracking**: Monitor dispute progress and outcomes

### Fraud Detection
- **Real-time Monitoring**: AI-powered analysis of transaction patterns
- **Risk Scoring**: Adaptive scoring system for transaction risk assessment
- **Alert Management**: Immediate notifications for suspicious activities

## API Endpoints

The platform provides several key API endpoints:

- `/api/actHandler` - Main workflow orchestration for cancellations and disputes
- `/api/cancelApi` - Direct API-based subscription cancellations
- `/api/cancelEmail` - Email-based cancellation workflows
- `/api/fraud-detection` - Fraud detection and risk assessment
- `/api/transactions` - Transaction data and management
- `/api/subscriptions` - Subscription tracking and management

## Architecture

Built with modern web technologies:

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Backend**: AWS Amplify with serverless functions
- **Authentication**: AWS Cognito integration
- **Database**: DynamoDB for real-time data storage
- **State Management**: React hooks with local storage persistence

## Installation

### Prerequisites
- Node.js 18.17+ (up to 20.x)
- npm or yarn package manager
- AWS CLI (for Amplify features)

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/kaeru.git
   cd kaeru
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables
   # Add AWS credentials if using Amplify features
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Optional: AWS Amplify Setup**
   ```bash
   # Initialize Amplify (if using cloud features)
   npx ampx sandbox
   ```

## Usage Examples

### Quick Actions
```typescript
// Launch a cancellation workflow
const result = await fetch('/api/actHandler', {
  method: 'POST',
  body: JSON.stringify({
    action: 'cancel',
    detectionItemId: 'sub-123',
    userId: 'user456'
  })
});

// File a dispute
const dispute = await fetch('/api/actHandler', {
  method: 'POST',
  body: JSON.stringify({
    action: 'dispute',
    detectionItemId: 'txn-789',
    userId: 'user456',
    metadata: transactionData
  })
});
```

### Transaction Management
```typescript
// Get transaction history
const transactions = await fetch('/api/transactions');
const data = await transactions.json();

// Export transaction data
const exportData = transactions.map(t => ({
  id: t.id,
  merchant: t.merchant,
  amount: t.amount,
  date: t.date,
  status: t.status
}));
```

## Security Features

- **Fraud Detection**: AI-powered transaction monitoring
- **Risk Assessment**: Multi-factor risk scoring system
- **Secure Authentication**: AWS Cognito integration
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Logging**: Complete activity tracking and logging

## Performance

- **Real-time Updates**: Live status monitoring and activity feeds
- **Optimized Rendering**: React 18 with concurrent features
- **Efficient Data Loading**: Server-side rendering with client-side hydration
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## Roadmap

- [ ] Enhanced AI agent capabilities
- [ ] Multi-provider integration expansion
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API rate limiting and optimization
- [ ] Enhanced fraud detection algorithms

---

**Kaeru** - Streamline your financial operations with AI-powered automation.