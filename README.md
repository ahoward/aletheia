# Aletheia - Decentralized Narrative Marketplace

![Aletheia Banner](https://via.placeholder.com/1200x300/1f2937/ffffff?text=Aletheia+%E2%80%A2+Veritas+Inversa+%E2%80%A2+Professional+Narrative+Underwriting)

> **Professional narrative underwriting platform built on Bittensor**  
> A sophisticated financial terminal for information markets and semantic truth validation.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🎯 Overview

Aletheia is a decentralized narrative marketplace that enables **professional narrative underwriting** through economic incentives. Unlike simple content generation platforms, Aletheia functions as a sophisticated financial terminal for information markets, allowing users to signal demand for strategic narratives and validate truth through staking mechanisms.

### Key Concepts
- **Narrative Underwriting**: Economic incentivization of high-value information creation
- **Semantic Truth Markets**: Market-driven validation of narrative accuracy and value  
- **Professional Terminal Interface**: Financial-grade UI for serious information market participants
- **Bittensor Integration**: Decentralized AI network for semantic analysis and validation

## 🏗️ Architecture

### Backend (`/backend`)
- **Framework**: Express.js + TypeScript 5.x
- **Architecture**: Library-first, service-oriented design
- **Authentication**: Wallet-based with JWT tokens
- **API**: RESTful with Socket.IO for real-time updates
- **Testing**: Comprehensive test suite with 9 passing tests

### Frontend (`/frontend`)
- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS with dark theme
- **State Management**: Zustand stores
- **Web3**: Ethers.js v6 for wallet integration
- **Design**: Professional financial terminal aesthetics

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- npm or yarn
- Web3 wallet (MetaMask recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aletheia
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Configure your environment variables
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Start the servers**
   ```bash
   # Terminal 1: Backend (port 3001)
   cd backend
   npm run dev

   # Terminal 2: Frontend (port 3002) 
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📱 Features

### 🏪 Narrative Marketplace
- **Browse & Search**: Advanced filtering with semantic search capabilities
- **Narrative Cards**: Professional display with modality indicators (text/image/video/audio)
- **Detailed Views**: Comprehensive narrative analytics and technical details
- **Real-time Updates**: Live data from the backend API

### 💰 Staking System  
- **Portfolio Management**: Track all staking positions with current values
- **Reward Tracking**: Monitor pending and earned rewards
- **Risk Management**: Built-in warnings and validation
- **One-click Operations**: Stake, unstake, and claim rewards

### 📊 Market Analytics
- **Total Value Locked (TVL)**: Real-time market metrics
- **Trending Analysis**: Momentum-based narrative rankings  
- **Market Statistics**: Comprehensive performance indicators
- **Data Visualization**: Professional charts and metrics

### 🔐 Web3 Authentication
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Challenge-Response**: Secure authentication without gas fees
- **Session Management**: JWT-based session handling
- **Role-based Access**: Basic, Validator, and Admin roles

### 🎨 Professional UI/UX
- **Financial Terminal Design**: Dark theme, data-dense layouts
- **Responsive**: Mobile-friendly across all devices
- **Real-time Notifications**: User feedback for all operations
- **Loading States**: Professional loading and error handling

## 🏗️ Development

### Backend Development

```bash
cd backend

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production  
npm run build

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing

The project includes comprehensive test coverage:

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if applicable)
cd frontend  
npm test
```

## 📂 Project Structure

```
aletheia/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── models/            # Data models (User, NarrativeNFT, etc.)
│   │   ├── services/          # Business logic services
│   │   ├── routes/            # API route handlers
│   │   ├── lib/               # Core libraries
│   │   └── index.ts           # Main server file
│   ├── tests/                 # Test suite
│   └── package.json
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Layout/        # Layout components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Dashboard/     # Dashboard components
│   │   │   ├── Narratives/    # Narrative components
│   │   │   ├── Staking/       # Staking components
│   │   │   ├── Market/        # Market components
│   │   │   └── UI/            # Shared UI components
│   │   ├── store/             # Zustand state management
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript type definitions
│   │   └── pages/             # Next.js pages
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3002
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Customization

#### Styling
- Primary colors and theme: `frontend/tailwind.config.js`
- Component styles: Individual component files
- Global styles: `frontend/src/styles/globals.css`

#### API Configuration  
- Backend routes: `backend/src/routes/`
- Frontend API client: `frontend/src/utils/api.ts`

## 🌐 API Documentation

### Authentication Endpoints
```
POST /v1/auth/challenge     # Generate wallet challenge
POST /v1/auth/connect       # Connect wallet and authenticate  
POST /v1/auth/verify        # Verify JWT token
POST /v1/auth/refresh       # Refresh JWT token
POST /v1/auth/logout        # Logout and revoke token
```

### Narrative Endpoints
```
GET  /v1/narratives         # List narratives with filtering
GET  /v1/narratives/:id     # Get narrative details
POST /v1/narratives         # Create new narrative
GET  /v1/narratives/trending # Get trending narratives
POST /v1/semantic/similar   # Find similar narratives
```

### Staking Endpoints
```
POST /v1/staking/stake      # Stake on narrative
POST /v1/staking/unstake    # Unstake from narrative  
GET  /v1/staking/positions  # Get user positions
GET  /v1/staking/rewards    # Get rewards data
POST /v1/staking/rewards/claim # Claim rewards
```

### Market Endpoints
```
GET  /v1/market/metrics     # Get market metrics
GET  /v1/market/trending    # Get trending data
GET  /v1/market/sentiment   # Get sentiment analysis
```

## 🔒 Security

### Authentication Security
- **No Private Keys**: Challenge-response flow requires no gas fees
- **JWT Tokens**: Secure session management with expiration  
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation

### Smart Contract Security  
- **Mock Implementation**: Current version uses mock contracts for development
- **Production Ready**: Architecture designed for real contract integration

## 🚢 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend  
cd frontend
npm run build
npm start
```

### Docker Deployment

```dockerfile
# Example Dockerfile for backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Considerations
- Set `NODE_ENV=production`
- Configure proper JWT secrets
- Set up SSL certificates
- Configure CORS for production domains

## 🤝 Contributing

We welcome contributions to Aletheia! Please see our contribution guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`  
5. **Open a Pull Request**

### Development Standards
- **TypeScript**: Strict type checking required
- **Testing**: All new features must include tests
- **Code Style**: ESLint and Prettier configuration enforced
- **Documentation**: Update README and inline documentation

## 📊 Current Status

### ✅ Completed Features
- [x] Complete backend API with 9 passing tests
- [x] Professional frontend with all major views
- [x] Wallet-based authentication system
- [x] Narrative marketplace with search and filtering  
- [x] Staking system with portfolio management
- [x] Market analytics dashboard
- [x] Real-time data integration
- [x] Responsive design and error handling

### 🚧 In Development  
- [ ] Narrative creation interface
- [ ] Advanced semantic analysis
- [ ] Smart contract integration
- [ ] Mobile application
- [ ] Advanced charts and visualizations

### 🔮 Roadmap
- **Q1 2024**: Smart contract deployment on testnet
- **Q2 2024**: Bittensor network integration
- **Q3 2024**: Mobile application launch
- **Q4 2024**: Mainnet deployment and public launch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bittensor**: For the decentralized AI network foundation
- **Ethereum**: For Web3 infrastructure and wallet integration
- **Next.js & React**: For the robust frontend framework
- **Tailwind CSS**: For the professional UI styling system

## 📞 Support

For support, questions, or contributions:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive inline code documentation
- **Community**: Join our developer community discussions

---

**Built with ❤️ for the decentralized truth economy**

*Aletheia - Where truth meets economics in the age of AI*