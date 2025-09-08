# Aletheia Platform - Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: 2025-09-07

## Overview

The Aletheia platform is a sophisticated web interface for the Veritas Inversa decentralized narrative market on Bittensor. This guide will help you get started quickly.

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- A Web3 wallet (MetaMask recommended)
- Test NARR tokens (available from faucet)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/veritas-inversa/aletheia.git
cd aletheia
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit the .env files with your configuration
# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - IPFS_GATEWAY_URL
# - ETHEREUM_RPC_URL
# - JWT_SECRET
```

### 4. Database Setup
```bash
# Create database
createdb aletheia_dev

# Run migrations
npm run db:migrate

# Seed with test data (development only)
npm run db:seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Redis (if not running as service)
redis-server

# The application will be available at http://localhost:3000
```

## Quick Test Scenarios

### Scenario 1: Connect Wallet and Browse Narratives
1. Navigate to http://localhost:3000
2. Click "Connect Wallet" in the top right
3. Approve the connection in MetaMask
4. Browse the Narrative Marketplace dashboard
5. Use filters to find narratives by modality or tags
6. Click on a narrative to see details

**Expected Result**: You can view all narratives with real-time metrics

### Scenario 2: Create a New Narrative
1. Click "Narrative Foundry" in the main navigation
2. Enter a narrative name and description
3. Add relevant tags
4. Select the modality (text, image, video)
5. Watch the semantic position update in real-time
6. Click "Mint Narrative"
7. Confirm the transaction in MetaMask

**Expected Result**: New narrative appears in marketplace with 0 stake

### Scenario 3: Stake on a Narrative
1. Find a narrative in the marketplace
2. Click "Stake" button
3. Enter amount of NARR tokens
4. Select lock-up period (minimum 7 days)
5. Review the potential returns
6. Click "Confirm Stake"
7. Approve the transaction

**Expected Result**: Staking position appears in your portfolio

### Scenario 4: View Semantic Landscape
1. Navigate to "Semantic Analysis" tool
2. Toggle between 2D and 3D visualization
3. Identify narrative clusters
4. Hover over points to see narrative details
5. Use zoom and pan to explore
6. Click on a cluster to filter marketplace

**Expected Result**: Interactive visualization of narrative semantic space

### Scenario 5: Validator Dashboard (Validator Role Required)
1. Switch to validator account
2. Navigate to "Validator Dashboard"
3. View network health metrics
4. Check consensus alignment score
5. Monitor oracle operational costs
6. Review recent validations

**Expected Result**: Real-time validator metrics and performance data

### Scenario 6: Miner Bounty Board (Miner Role Required)
1. Switch to miner account
2. Navigate to "Miner Dashboard"
3. View bounty board sorted by potential rewards
4. Filter by your specialization (text/image/video)
5. Click on a bounty for details
6. Submit a dissemination proof

**Expected Result**: Bounties displayed with reward calculations

## API Testing

### Test Authentication
```bash
# Get auth token
curl -X POST http://localhost:3001/v1/auth/connect \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x...",
    "signature": "0x...",
    "message": "Sign this message to authenticate"
  }'
```

### Test Narrative Listing
```bash
# List narratives
curl http://localhost:3001/v1/narratives \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test WebSocket Connection
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3001/v1/ws');
ws.onmessage = (event) => console.log('Update:', event.data);
ws.send(JSON.stringify({ subscribe: 'market' }));
```

## Performance Validation

### Load Testing
```bash
# Run load tests
npm run test:load

# Expected results:
# - API response time < 200ms (p95)
# - WebSocket latency < 50ms
# - Dashboard load time < 2s
# - 1000 concurrent connections supported
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific test suites
npm run test:integration -- --grep "Staking"
npm run test:integration -- --grep "Semantic"
```

## Common Issues

### Issue: Wallet Connection Fails
**Solution**: Ensure MetaMask is on the correct network (localhost:8545 for development)

### Issue: No Narratives Displayed
**Solution**: Run `npm run db:seed` to populate test data

### Issue: Semantic Embedding Errors
**Solution**: Ensure the Python embedding service is running: `cd services/embeddings && python server.py`

### Issue: Real-time Updates Not Working
**Solution**: Check Redis connection and WebSocket configuration

## Architecture Overview

```
Frontend (Next.js)
    ↓
API Gateway (Express)
    ↓
Backend Services
├── Auth Service (JWT)
├── Narrative Service
├── Staking Service
├── Semantic Service (Python)
└── Market Data Service
    ↓
PostgreSQL + Redis
    ↓
Blockchain (via Ethers.js)
```

## Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Write tests first (TDD)
   - Implement feature
   - Run tests: `npm test`
   - Submit PR

2. **Testing Strategy**
   - Contract tests: `npm run test:contracts`
   - Integration tests: `npm run test:integration`
   - E2E tests: `npm run test:e2e`
   - Load tests: `npm run test:load`

3. **Deployment**
   - Staging: Automatic on PR merge
   - Production: Manual promotion from staging

## Support

- Documentation: https://docs.aletheia.network
- Discord: https://discord.gg/aletheia
- GitHub Issues: https://github.com/veritas-inversa/aletheia/issues

## License

Copyright (c) 2025 Veritas Inversa. All rights reserved.