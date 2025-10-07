<p align="center">
<img width="128" height="128" src="public/kaeru-icon.svg" alt="Kaeru - Return, restore, and reclaim your finances">
</p>

<p align="center">
<strong>Return, restore, and reclaim your finances with AI-powered automation</strong>
</p>

<p align="center">
<a href="#features">Features</a> |
<a href="#quick-start">Quick Start</a> |
<a href="#documentation">Documentation</a>
</p>

---

# Kaeru
> 帰る (kaeru) - to return, go back, or restore

An AI-powered financial operations platform that automates cancellations, disputes, and customer outreach.

- Automate subscription cancellations across multiple providers
- Detect and dispute fraudulent transactions in real-time
- Manage all financial operations from a single dashboard
- AI agents handle phone calls and email workflows

It's a smarter, more efficient way to manage your financial life.

Visit the [documentation](#documentation) for detailed setup guides and API references.

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

## How It Works

### Cancellation Management
- **Smart Cancellations**: Automatically cancel subscriptions across multiple providers
- **Phone Call Automation**: AI agents make cancellation calls for you
- **Email Workflows**: Automated cancellation requests sent via email

### Dispute Resolution
- **One-Click Disputes**: File disputes directly from your transaction history
- **Fraud Protection**: Automatic detection and dispute filing for suspicious charges
- **Progress Tracking**: Monitor your dispute status and outcomes

### Fraud Detection
- **Real-time Monitoring**: AI watches your transactions 24/7
- **Smart Alerts**: Get notified immediately about suspicious activity
- **Risk Assessment**: Advanced scoring to identify potential fraud

## Installation

Kaeru requires Node.js 18.17+ and npm or yarn.

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

## What You Get

- **Dashboard**: Clean, intuitive interface to manage all your financial operations
- **Transaction History**: Complete view of all your financial activities
- **Smart Alerts**: Get notified about suspicious charges and subscription renewals
- **Export Data**: Download your transaction history and reports
- **Mobile Friendly**: Works great on your phone, tablet, or computer

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

For detailed setup guides and API references, check the `/docs` directory:

- [`PLAID_SETUP.md`](docs/PLAID_SETUP.md) - Plaid integration setup
- [`FRAUD_DETECTION_README.md`](docs/FRAUD_DETECTION_README.md) - Fraud detection system
- [`AI_FRAUD_DETECTION_SETUP.md`](docs/AI_FRAUD_DETECTION_SETUP.md) - AI setup guide
- [`vapi-assistants.md`](docs/vapi-assistants.md) - VAPI assistant configuration

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions


---