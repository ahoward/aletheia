# Claude Code Context - Aletheia Project

## Project Overview
Building a sophisticated web platform for the Veritas Inversa decentralized narrative market on Bittensor. The platform reframes content generation as "narrative underwriting" with a minimalist, clinical aesthetic similar to financial trading terminals.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5.x
- **Backend**: Node.js 20 LTS, Express
- **Database**: PostgreSQL 15 with TimescaleDB
- **Cache**: Redis 7
- **Blockchain**: Ethers.js v6
- **Real-time**: Socket.io
- **Visualization**: D3.js
- **Testing**: Jest, React Testing Library, Playwright

## Project Structure
```
aletheia/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Next.js pages
│   │   ├── services/    # API clients
│   │   └── lib/         # Utilities
│   └── tests/
├── backend/            # Express API
│   ├── src/
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   └── api/         # Routes
│   └── tests/
├── specs/              # Feature specifications
└── scripts/            # Build and deployment
```

## Key Features
1. **Narrative Marketplace**: Real-time dashboard for viewing narratives
2. **Narrative Foundry**: NFT creation with semantic positioning
3. **Semantic Landscape**: Visualization of narrative competition
4. **Staking System**: Token management for narrative underwriting
5. **Validator Dashboard**: Network health and consensus metrics
6. **Miner Dashboard**: Bounty board and proof submission

## Current Development Phase
- Phase 1: Design & Architecture ✓
- Phase 2: Task Planning (Ready for /tasks command)

## API Endpoints
Base URL: `http://localhost:3001/v1`
- POST `/auth/connect` - Web3 wallet authentication
- GET `/narratives` - List narrative NFTs
- POST `/narratives` - Create new narrative
- POST `/narratives/{id}/stake` - Stake tokens
- GET `/semantic/landscape` - Semantic visualization data
- GET `/validators/dashboard` - Validator metrics
- GET `/miners/bounties` - High-value narratives

## Development Commands
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Database operations
npm run db:migrate
npm run db:seed
```

## Testing Strategy
1. Contract tests first (API contracts)
2. Integration tests (database, services)
3. E2E tests (user journeys)
4. Unit tests (utilities, helpers)

## Environment Variables
Required in `.env`:
- DATABASE_URL
- REDIS_URL
- IPFS_GATEWAY_URL
- ETHEREUM_RPC_URL
- JWT_SECRET

## Recent Changes
- Created comprehensive API specification (OpenAPI)
- Defined complete data model with PostgreSQL schema
- Established project structure with frontend/backend separation

## Next Steps
1. Generate implementation tasks (/tasks command)
2. Set up project scaffolding
3. Implement contract tests
4. Build core API endpoints
5. Create React components
6. Integrate Web3 functionality

## Important Notes
- TDD enforced: Tests must be written before implementation
- All features implemented as libraries with CLI interfaces
- Structured logging in JSON format
- Real-time updates via WebSocket with 1s intervals
- Semantic embeddings generated via Python microservice

## Performance Targets
- API response time: <200ms (p95)
- Dashboard load: <2 seconds
- Support 1000 concurrent users
- Real-time updates: 1 second intervals