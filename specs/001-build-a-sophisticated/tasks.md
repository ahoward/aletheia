# Tasks: Veritas Inversa (Aletheia) Website

**Input**: Design documents from `/specs/001-build-a-sophisticated/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/api-v1.yaml (✓)

## Execution Flow Summary
Tech Stack: TypeScript 5.x, Node.js 20, React 18, Next.js 14, PostgreSQL 15, Redis 7
Structure: Web application (frontend + backend)
Testing: Jest, React Testing Library, Playwright

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Project Setup & Infrastructure

- [ ] T001 Create project structure with frontend/ and backend/ directories per plan.md
- [ ] T002 Initialize backend with Express, TypeScript, and Node.js 20 configuration
- [ ] T003 Initialize frontend with Next.js 14, React 18, and TypeScript
- [ ] T004 [P] Configure ESLint and Prettier for both frontend and backend
- [ ] T005 [P] Set up PostgreSQL database with TimescaleDB extension
- [ ] T006 [P] Set up Redis for caching and pub/sub
- [ ] T007 Create shared TypeScript interfaces in shared/types/
- [ ] T008 [P] Configure environment variables and .env.example files
- [ ] T009 Set up database migration tool (Prisma or TypeORM) in backend/

## Phase 3.2: Contract Tests (TDD - MUST FAIL FIRST) ⚠️

### Authentication Tests
- [ ] T010 [P] Contract test POST /v1/auth/connect in backend/tests/contract/auth.connect.test.ts
- [ ] T011 [P] Contract test auth token validation in backend/tests/contract/auth.validation.test.ts

### Narrative Tests  
- [ ] T012 [P] Contract test GET /v1/narratives in backend/tests/contract/narratives.list.test.ts
- [ ] T013 [P] Contract test POST /v1/narratives in backend/tests/contract/narratives.create.test.ts
- [ ] T014 [P] Contract test GET /v1/narratives/{id} in backend/tests/contract/narratives.get.test.ts
- [ ] T015 [P] Contract test GET /v1/narratives/{id}/metrics in backend/tests/contract/narratives.metrics.test.ts

### Staking Tests
- [ ] T016 [P] Contract test POST /v1/narratives/{id}/stake in backend/tests/contract/staking.stake.test.ts
- [ ] T017 [P] Contract test GET /v1/staking/positions in backend/tests/contract/staking.positions.test.ts
- [ ] T018 [P] Contract test POST /v1/staking/positions/{id}/unstake in backend/tests/contract/staking.unstake.test.ts

### Semantic Tests
- [ ] T019 [P] Contract test POST /v1/semantic/similar in backend/tests/contract/semantic.similar.test.ts
- [ ] T020 [P] Contract test GET /v1/semantic/landscape in backend/tests/contract/semantic.landscape.test.ts

### Validator/Miner Tests
- [ ] T021 [P] Contract test GET /v1/validators in backend/tests/contract/validators.list.test.ts
- [ ] T022 [P] Contract test GET /v1/validators/dashboard in backend/tests/contract/validators.dashboard.test.ts
- [ ] T023 [P] Contract test GET /v1/miners in backend/tests/contract/miners.list.test.ts
- [ ] T024 [P] Contract test GET /v1/miners/bounties in backend/tests/contract/miners.bounties.test.ts
- [ ] T025 [P] Contract test POST /v1/miners/proofs in backend/tests/contract/miners.proofs.test.ts

### Market Tests
- [ ] T026 [P] Contract test GET /v1/market/overview in backend/tests/contract/market.overview.test.ts
- [ ] T027 [P] Contract test WebSocket /v1/ws connection in backend/tests/contract/websocket.test.ts

## Phase 3.3: Integration Tests (MUST FAIL FIRST) ⚠️

- [ ] T028 [P] Integration test: Connect wallet and browse narratives in backend/tests/integration/wallet.browse.test.ts
- [ ] T029 [P] Integration test: Create new narrative NFT in backend/tests/integration/narrative.create.test.ts
- [ ] T030 [P] Integration test: Stake tokens on narrative in backend/tests/integration/staking.flow.test.ts
- [ ] T031 [P] Integration test: View semantic landscape in backend/tests/integration/semantic.landscape.test.ts
- [ ] T032 [P] Integration test: Validator dashboard flow in backend/tests/integration/validator.dashboard.test.ts
- [ ] T033 [P] Integration test: Miner bounty board flow in backend/tests/integration/miner.bounty.test.ts

## Phase 3.4: Core Models Implementation

- [ ] T034 [P] Create User model in backend/src/models/User.ts
- [ ] T035 [P] Create NarrativeNFT model in backend/src/models/NarrativeNFT.ts
- [ ] T036 [P] Create StakingPosition model in backend/src/models/StakingPosition.ts
- [ ] T037 [P] Create Validator model in backend/src/models/Validator.ts
- [ ] T038 [P] Create Miner model in backend/src/models/Miner.ts
- [ ] T039 [P] Create FulfillmentActivity model in backend/src/models/FulfillmentActivity.ts
- [ ] T040 [P] Create DisseminationProof model in backend/src/models/DisseminationProof.ts
- [ ] T041 [P] Create MarketMetrics model in backend/src/models/MarketMetrics.ts
- [ ] T042 [P] Create Transaction model in backend/src/models/Transaction.ts
- [ ] T043 Create database migrations for all models in backend/migrations/

## Phase 3.5: Core Libraries Implementation

- [ ] T044 Create semantic-engine library in backend/src/lib/semantic-engine/ with CLI
- [ ] T045 Create narrative-contracts library in backend/src/lib/narrative-contracts/ with CLI
- [ ] T046 Create market-data library in backend/src/lib/market-data/ with CLI
- [ ] T047 Create visualization library in frontend/src/lib/visualization/ with D3.js components
- [ ] T048 [P] Add --help, --version, --format json to each library CLI

## Phase 3.6: Backend Services Implementation

- [ ] T049 Implement AuthService with Web3 wallet verification in backend/src/services/AuthService.ts
- [ ] T050 Implement NarrativeService CRUD operations in backend/src/services/NarrativeService.ts
- [ ] T051 Implement StakingService with lock-up logic in backend/src/services/StakingService.ts
- [ ] T052 Implement SemanticService with embedding generation in backend/src/services/SemanticService.ts
- [ ] T053 Implement ValidatorService with dashboard data in backend/src/services/ValidatorService.ts
- [ ] T054 Implement MinerService with bounty calculations in backend/src/services/MinerService.ts
- [ ] T055 Implement MarketDataService with aggregation in backend/src/services/MarketDataService.ts
- [ ] T056 Implement WebSocketService with Socket.io in backend/src/services/WebSocketService.ts

## Phase 3.7: API Endpoints Implementation

- [ ] T057 Implement POST /v1/auth/connect endpoint in backend/src/api/auth.ts
- [ ] T058 Implement GET /v1/narratives endpoint in backend/src/api/narratives.ts
- [ ] T059 Implement POST /v1/narratives endpoint in backend/src/api/narratives.ts
- [ ] T060 Implement GET /v1/narratives/{id} endpoint in backend/src/api/narratives.ts
- [ ] T061 Implement GET /v1/narratives/{id}/metrics endpoint in backend/src/api/narratives.ts
- [ ] T062 Implement POST /v1/narratives/{id}/stake endpoint in backend/src/api/staking.ts
- [ ] T063 Implement GET /v1/staking/positions endpoint in backend/src/api/staking.ts
- [ ] T064 Implement POST /v1/staking/positions/{id}/unstake endpoint in backend/src/api/staking.ts
- [ ] T065 Implement POST /v1/semantic/similar endpoint in backend/src/api/semantic.ts
- [ ] T066 Implement GET /v1/semantic/landscape endpoint in backend/src/api/semantic.ts
- [ ] T067 Implement GET /v1/validators endpoint in backend/src/api/validators.ts
- [ ] T068 Implement GET /v1/validators/dashboard endpoint in backend/src/api/validators.ts
- [ ] T069 Implement GET /v1/miners endpoint in backend/src/api/miners.ts
- [ ] T070 Implement GET /v1/miners/bounties endpoint in backend/src/api/miners.ts
- [ ] T071 Implement POST /v1/miners/proofs endpoint in backend/src/api/miners.ts
- [ ] T072 Implement GET /v1/market/overview endpoint in backend/src/api/market.ts
- [ ] T073 Implement WebSocket /v1/ws handler in backend/src/api/websocket.ts

## Phase 3.8: Frontend Components Implementation

### Layout & Core Components
- [ ] T074 Create AppLayout component with navigation in frontend/src/components/Layout/AppLayout.tsx
- [ ] T075 Create WalletConnect component in frontend/src/components/Auth/WalletConnect.tsx
- [ ] T076 [P] Create LoadingSpinner component in frontend/src/components/Common/LoadingSpinner.tsx
- [ ] T077 [P] Create ErrorBoundary component in frontend/src/components/Common/ErrorBoundary.tsx

### Marketplace Components
- [ ] T078 Create NarrativeCard component in frontend/src/components/Marketplace/NarrativeCard.tsx
- [ ] T079 Create NarrativeList component in frontend/src/components/Marketplace/NarrativeList.tsx
- [ ] T080 Create MarketplaceFilters component in frontend/src/components/Marketplace/Filters.tsx
- [ ] T081 Create StakingModal component in frontend/src/components/Marketplace/StakingModal.tsx

### Narrative Foundry Components
- [ ] T082 Create NarrativeForm component in frontend/src/components/Foundry/NarrativeForm.tsx
- [ ] T083 Create SemanticPreview component in frontend/src/components/Foundry/SemanticPreview.tsx
- [ ] T084 Create MintingFlow component in frontend/src/components/Foundry/MintingFlow.tsx

### Semantic Visualization Components
- [ ] T085 Create SemanticLandscape3D component in frontend/src/components/Semantic/Landscape3D.tsx
- [ ] T086 Create ClusterAnalysis component in frontend/src/components/Semantic/ClusterAnalysis.tsx
- [ ] T087 Create SimilarityMatrix component in frontend/src/components/Semantic/SimilarityMatrix.tsx

### Dashboard Components
- [ ] T088 Create ValidatorDashboard component in frontend/src/components/Validator/Dashboard.tsx
- [ ] T089 Create MinerDashboard component in frontend/src/components/Miner/Dashboard.tsx
- [ ] T090 Create BountyBoard component in frontend/src/components/Miner/BountyBoard.tsx
- [ ] T091 Create MetricsChart component in frontend/src/components/Charts/MetricsChart.tsx

## Phase 3.9: Frontend Pages Implementation

- [ ] T092 Create marketplace page in frontend/src/pages/marketplace.tsx
- [ ] T093 Create narrative foundry page in frontend/src/pages/foundry.tsx
- [ ] T094 Create semantic analysis page in frontend/src/pages/semantic.tsx
- [ ] T095 Create validator dashboard page in frontend/src/pages/validator.tsx
- [ ] T096 Create miner dashboard page in frontend/src/pages/miner.tsx
- [ ] T097 Create portfolio page in frontend/src/pages/portfolio.tsx
- [ ] T098 Create narrative detail page in frontend/src/pages/narrative/[id].tsx

## Phase 3.10: Integration & Middleware

- [ ] T099 Set up authentication middleware in backend/src/middleware/auth.ts
- [ ] T100 Set up CORS configuration in backend/src/middleware/cors.ts
- [ ] T101 Set up rate limiting in backend/src/middleware/rateLimit.ts
- [ ] T102 Set up request logging in backend/src/middleware/logging.ts
- [ ] T103 Connect Redis for caching in backend/src/config/redis.ts
- [ ] T104 Set up database connection pool in backend/src/config/database.ts
- [ ] T105 Configure IPFS client in backend/src/config/ipfs.ts
- [ ] T106 Set up WebSocket authentication in backend/src/middleware/wsAuth.ts

## Phase 3.11: Frontend Services & State

- [ ] T107 Create API client service in frontend/src/services/api.ts
- [ ] T108 Create Web3 service with Ethers.js in frontend/src/services/web3.ts
- [ ] T109 Create WebSocket client in frontend/src/services/websocket.ts
- [ ] T110 Set up Zustand store for app state in frontend/src/store/
- [ ] T111 Set up React Query for server state in frontend/src/hooks/

## Phase 3.12: E2E Tests

- [ ] T112 [P] E2E test: Complete user journey in e2e/tests/userJourney.spec.ts
- [ ] T113 [P] E2E test: Narrative creation flow in e2e/tests/narrativeCreation.spec.ts
- [ ] T114 [P] E2E test: Staking workflow in e2e/tests/stakingWorkflow.spec.ts
- [ ] T115 [P] E2E test: Real-time updates in e2e/tests/realtimeUpdates.spec.ts

## Phase 3.13: Performance & Polish

- [ ] T116 [P] Add unit tests for validation logic in backend/tests/unit/
- [ ] T117 [P] Add unit tests for React components in frontend/tests/unit/
- [ ] T118 Performance optimization: API response caching
- [ ] T119 Performance optimization: Frontend bundle splitting
- [ ] T120 [P] Load testing setup with k6 in tests/load/
- [ ] T121 Security audit: Input sanitization
- [ ] T122 Security audit: Rate limiting verification
- [ ] T123 [P] Generate API documentation from OpenAPI spec
- [ ] T124 [P] Update README.md with setup instructions
- [ ] T125 Final testing: Run quickstart.md scenarios

## Dependencies Graph

```
Setup (T001-T009) 
    ↓
Contract Tests (T010-T027) + Integration Tests (T028-T033) [MUST FAIL FIRST]
    ↓
Models (T034-T043) + Libraries (T044-T048) [Parallel]
    ↓
Services (T049-T056)
    ↓
API Endpoints (T057-T073)
    ↓
Frontend Components (T074-T091) + Pages (T092-T098) [Parallel]
    ↓
Integration & Middleware (T099-T106) + Frontend Services (T107-T111)
    ↓
E2E Tests (T112-T115)
    ↓
Performance & Polish (T116-T125)
```

## Parallel Execution Examples

### Batch 1: Contract Tests (after setup)
```bash
# Launch T010-T027 together (all different test files):
Task: "Contract test POST /v1/auth/connect in backend/tests/contract/auth.connect.test.ts"
Task: "Contract test GET /v1/narratives in backend/tests/contract/narratives.list.test.ts"
Task: "Contract test POST /v1/narratives in backend/tests/contract/narratives.create.test.ts"
# ... continue for all contract tests
```

### Batch 2: Models (after tests fail)
```bash
# Launch T034-T042 together (all different model files):
Task: "Create User model in backend/src/models/User.ts"
Task: "Create NarrativeNFT model in backend/src/models/NarrativeNFT.ts"
Task: "Create StakingPosition model in backend/src/models/StakingPosition.ts"
# ... continue for all models
```

### Batch 3: Frontend Components (after API ready)
```bash
# Launch T074-T091 together (all different component files):
Task: "Create NarrativeCard component in frontend/src/components/Marketplace/NarrativeCard.tsx"
Task: "Create SemanticLandscape3D component in frontend/src/components/Semantic/Landscape3D.tsx"
# ... continue for all components
```

## Critical Notes

1. **TDD ENFORCEMENT**: T010-T033 MUST be written first and MUST fail before implementation
2. **Library CLIs**: Each library (T044-T047) must expose CLI with --help, --version, --format json
3. **Real Dependencies**: Use actual PostgreSQL and Redis, not mocks
4. **Structured Logging**: All services must use JSON format logging
5. **WebSocket Testing**: T027 and T115 require special handling for real-time testing
6. **Semantic Engine**: T044 requires Python microservice setup for embeddings
7. **Performance Goals**: <200ms API response, <2s page load must be validated in T118-T120

## Validation Checklist

- ✓ All contracts have corresponding tests (T010-T027)
- ✓ All entities have model tasks (T034-T042)
- ✓ All tests come before implementation
- ✓ Parallel tasks are truly independent (different files)
- ✓ Each task specifies exact file path
- ✓ No parallel task modifies same file as another [P] task
- ✓ All 6 quickstart scenarios covered in integration tests
- ✓ All libraries have CLI interfaces per constitution

**Total Tasks**: 125
**Estimated Duration**: 3-4 weeks with 2 developers
**Critical Path**: Setup → Tests → Models → Services → API → Frontend → E2E