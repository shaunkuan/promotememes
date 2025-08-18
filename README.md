# 🚀 MemeCoin Promoter - Full Stack Application

A complete web application that replicates promotememes.com functionality for promoting Solana meme coins on social media platforms.

## 🏗️ Project Structure

```
promotememes-clone/
├── frontend/          # Next.js React application
├── backend/           # Node.js Express API
├── shared/            # Shared types and utilities
└── docs/             # Documentation
```

## 🖥️ Frontend Features

- **Landing Page**: Beautiful gradient design with real-time stats
- **Promotion Form**: Token address input, plan selection, wallet integration
- **Live Feed**: Recent promotions with market cap and status
- **Responsive Design**: Works on desktop and mobile

## 🧠 Backend Features

- **REST API**: Express.js server with comprehensive endpoints
- **Social Media Integration**: Twitter, Discord, and Telegram posting
- **Token Verification**: Solana blockchain integration
- **Job Queue**: Scheduled promotion processing
- **Payment Processing**: Solana wallet integration

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ installed
- npm or yarn package manager

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3001`.

## 📱 API Endpoints

### Promotions
- `GET /api/promotions/recent` - Get recent promotions
- `GET /api/promotions/stats` - Get promotion statistics
- `POST /api/promotions/create` - Create new promotion
- `GET /api/promotions/status/:id` - Get promotion status

### Tokens
- `POST /api/tokens/verify` - Verify Solana token
- `GET /api/tokens/market/:address` - Get token market data

### Wallet
- `POST /api/wallet/validate-payment` - Validate Solana payment
- `GET /api/wallet/payment-address` - Get payment address

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Social Media APIs (get these from respective platforms)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

OPENAI_API_KEY=your_openai_api_key
```

## 🎯 Features Implemented

### ✅ Completed
- [x] Landing page with real-time stats
- [x] Promotion form with plan selection
- [x] Recent promotions feed
- [x] Backend API with mock data
- [x] Social media posting services (Twitter, Discord, Telegram)
- [x] Promotion scheduling system
- [x] Responsive design

### 🔄 In Progress
- [ ] Solana wallet integration
- [ ] Real token verification
- [ ] Payment processing
- [ ] Real social media API integration

### 📋 TODO
- [ ] Database integration
- [ ] User authentication
- [ ] Advanced analytics
- [ ] Real-time notifications
- [ ] Admin dashboard

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Solana Wallet Adapter** - Wallet integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Twitter API v2** - Twitter posting
- **Discord.js** - Discord bot
- **node-telegram-bot-api** - Telegram bot
- **Solana Web3.js** - Blockchain integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Please respect the terms of service of all integrated platforms.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that both frontend and backend are running

---

**Note**: This is a demonstration project. For production use, implement proper security measures, error handling, and rate limiting.
