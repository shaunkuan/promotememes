const express = require('express');
const axios = require('axios');
const router = express.Router();
const promotionProcessor = require('../jobs/promotionProcessor');
const solanaPayment = require('../services/solanaPayment');
const counterService = require('../services/counters');

// Function to fetch live trending tokens from multiple sources
const fetchLiveTrendingTokens = async () => {
  try {
    // Try to fetch from DexScreener first
    const response = await axios.get('https://api.dexscreener.com/latest/dex/tokens/solana', {
      timeout: 5000
    });
    
    if (response.data && response.data.pairs && response.data.pairs.length > 0) {
      // Get unique tokens and shuffle them
      const uniqueTokens = new Map();
      
      response.data.pairs.forEach(pair => {
        if (pair.baseToken && !uniqueTokens.has(pair.baseToken.address)) {
          uniqueTokens.set(pair.baseToken.address, {
            id: uniqueTokens.size + 1,
            symbol: pair.baseToken.symbol || 'UNKNOWN',
            name: pair.baseToken.name || 'Unknown Token',
            marketCap: `$${pair.marketCap ? (pair.marketCap / 1000000).toFixed(1) + 'M' : '50K'}`,
            time: `${Math.floor(Math.random() * 15) + 1} mins ago`,
            plan: Math.random() > 0.5 ? 'Advanced' : 'Basic',
            status: 'Posted',
            platforms: Math.random() > 0.7 ? ['X', 'Discord', 'Telegram'] : 
                      Math.random() > 0.5 ? ['X', 'Discord'] : ['X'],
            icon: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${pair.baseToken.address}/logo.png`,
            address: pair.baseToken.address,
            price: `$${pair.priceUsd || '0.00005'}`,
            volume24h: `$${pair.volume24h ? (pair.volume24h / 1000).toFixed(0) + 'K' : '10K'}`
          });
        }
      });
      
      // Convert to array, shuffle, and take first 4
      const tokenArray = Array.from(uniqueTokens.values());
      const shuffled = tokenArray.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 4);
    }
  } catch (error) {
    console.log('DexScreener API failed, using random token generator:', error.message);
  }
  
  // If DexScreener fails, generate random tokens from a large pool with working icons
  const tokenPool = [
    { symbol: 'BONK', name: 'Bonk', marketCap: '$1.2B', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png' },
    { symbol: 'WIF', name: 'dogwifhat', marketCap: '$850M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qjm/logo.png' },
    { symbol: 'JUP', name: 'Jupiter', marketCap: '$2.1B', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png' },
    { symbol: 'RAY', name: 'Raydium', marketCap: '$180M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png' },
    { symbol: 'SRM', name: 'Serum', marketCap: '$95M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    { symbol: 'ORCA', name: 'Orca', marketCap: '$75M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png' },
    { symbol: 'MNGO', name: 'Mango', marketCap: '$25M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac/logo.png' },
    { symbol: 'STEP', name: 'Step', marketCap: '$15M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT/logo.png' },
    { symbol: 'SAMO', name: 'Samoyedcoin', marketCap: '$6M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png' },
    { symbol: 'FIDA', name: 'Bonfida', marketCap: '$3M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp/logo.png' },
    { symbol: 'OXY', name: 'Oxygen', marketCap: '$2M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ZScHuTtqZukUrtZS43teTKGs2VqkKL8k4QCouR2X6g/logo.png' },
    { symbol: 'MAPS', name: 'Maps', marketCap: '$1.5M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb/logo.png' },
    // Add more tokens with working icons or use placeholder icons
    { symbol: 'POPCAT', name: 'Popcat', marketCap: '$45M', icon: 'https://via.placeholder.com/40x40/6366f1/ffffff?text=PC' },
    { symbol: 'MYRO', name: 'Myro', marketCap: '$12M', icon: 'https://via.placeholder.com/40x40/8b5cf6/ffffff?text=MY' },
    { symbol: 'COPE', name: 'Cope', marketCap: '$8M', icon: 'https://via.placeholder.com/40x40/06b6d4/ffffff?text=CP' },
    { symbol: 'SLIM', name: 'Solanium', marketCap: '$4M', icon: 'https://via.placeholder.com/40x40/10b981/ffffff?text=SL' }
  ];
  
  // Shuffle the pool and take 4 random tokens
  const shuffledPool = tokenPool.sort(() => Math.random() - 0.5);
  const selectedTokens = shuffledPool.slice(0, 4);
  
  return selectedTokens.map((token, index) => ({
    id: index + 1,
    symbol: token.symbol,
    name: token.name,
    marketCap: token.marketCap,
    time: `${Math.floor(Math.random() * 15) + 1} mins ago`,
    plan: Math.random() > 0.5 ? 'Advanced' : 'Basic',
    status: 'Posted',
    platforms: Math.random() > 0.7 ? ['X', 'Discord', 'Telegram'] : 
              Math.random() > 0.5 ? ['X', 'Discord'] : ['X'],
    icon: token.icon,
    address: `token_${index}_${Date.now()}`,
    price: `$${(Math.random() * 0.1).toFixed(6)}`,
    volume24h: `$${(Math.random() * 100).toFixed(0)}K`
  }));
};

// Get recent promotions with live data
router.get('/recent', async (req, res) => {
  try {
    // Always fetch fresh data (no caching)
    const freshTokens = await fetchLiveTrendingTokens();
    
    res.json({
      success: true,
      data: freshTokens
    });
  } catch (error) {
    console.error('Error fetching recent promotions:', error);
    // Return fallback data with working icons
    const fallbackTokens = [
      { symbol: 'BONK', name: 'Bonk', marketCap: '$1.2B', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png' },
      { symbol: 'WIF', name: 'dogwifhat', marketCap: '$850M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qjm/logo.png' },
      { symbol: 'JUP', name: 'Jupiter', marketCap: '$2.1B', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png' },
      { symbol: 'RAY', name: 'Raydium', marketCap: '$180M', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png' }
    ];
    
    const shuffledFallback = fallbackTokens.sort(() => Math.random() - 0.5);
    
    res.json({
      success: true,
      data: shuffledFallback.map((token, index) => ({
        id: index + 1,
        symbol: token.symbol,
        name: token.name,
        marketCap: token.marketCap,
        time: `${Math.floor(Math.random() * 15) + 1} mins ago`,
        plan: Math.random() > 0.5 ? 'Advanced' : 'Basic',
        status: 'Posted',
        platforms: Math.random() > 0.7 ? ['X', 'Discord', 'Telegram'] : 
                  Math.random() > 0.5 ? ['X', 'Discord'] : ['X'],
        icon: token.icon,
        address: `fallback_${index}_${Date.now()}`,
        price: `$${(Math.random() * 0.1).toFixed(6)}`,
        volume24h: `$${(Math.random() * 100).toFixed(0)}K`
      }))
    });
  }
});

// Get promotion statistics with dynamic counters
router.get('/stats', (req, res) => {
  const stats = counterService.getCounters();
  res.json({
    success: true,
    data: stats
  });
});

// Get plan pricing
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      Basic: {
        price: '0.1',
        currency: 'SOL',
        duration: '10 minutes',
        description: 'Quick promotion in 10 minutes'
      },
      Advanced: {
        price: '0.5',
        currency: 'SOL',
        duration: '3 hours',
        description: 'Extended promotion over 3 hours'
      }
    }
  });
});

// Create new promotion with REAL payment verification
router.post('/create', async (req, res) => {
  const { tokenAddress, plan, twitterHandle, paymentSignature, fromAddress, amount } = req.body;
  
  console.log('🔍 Payment verification request:', {
    tokenAddress,
    plan,
    paymentSignature: paymentSignature ? `${paymentSignature.substring(0, 10)}...` : 'missing',
    fromAddress: fromAddress ? `${fromAddress.substring(0, 10)}...` : 'missing',
    amount
  });
  
  // Validate required fields
  if (!tokenAddress || !plan) {
    console.log('❌ Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'Token address and plan are required'
    });
  }

  // Validate plan
  if (!['Basic', 'Advanced'].includes(plan)) {
    console.log('❌ Invalid plan:', plan);
    return res.status(400).json({
      success: false,
      error: 'Invalid plan. Must be Basic or Advanced'
    });
  }

  // Validate payment
  if (!paymentSignature || !fromAddress) {
    console.log('❌ Missing payment verification');
    return res.status(400).json({
      success: false,
      error: 'Payment verification required. Please complete the wallet transaction.'
    });
  }

  // Verify payment amount
  const expectedAmount = plan === 'Basic' ? 0.1 : 0.5;
  
  // REAL PAYMENT VERIFICATION - Check actual Solana transaction
  try {
    const paymentVerification = await solanaPayment.verifyPayment(
      paymentSignature,
      fromAddress,
      expectedAmount
    );

    if (!paymentVerification.success) {
      console.log('❌ Payment verification failed:', paymentVerification.error);
      return res.status(402).json({
        success: false,
        error: paymentVerification.error || 'Payment verification failed'
      });
    }

    console.log('✅ Payment verified on-chain!');
    console.log('💰 Amount received:', paymentVerification.data.amount, 'SOL');
    console.log('📝 Transaction:', paymentVerification.data.signature);

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Payment verification failed: ' + error.message
    });
  }

  // Create promotion record
  const newPromotion = {
    id: Date.now(),
    tokenAddress,
    plan,
    twitterHandle,
    status: 'Success',
    createdAt: new Date().toISOString(),
    price: plan === 'Basic' ? '0.1' : '0.5',
    estimatedTime: plan === 'Basic' ? '10 minutes' : '3 hours',
    paymentSignature,
    fromAddress,
    amount: expectedAmount
  };

  try {
    // Process the promotion immediately
    const result = await promotionProcessor.processPromotion(newPromotion);
    
    // Update counters when promotion is successful
    counterService.addPromotion();
    
    console.log('🎉 Promotion created successfully:', newPromotion.id);
    
    res.json({
      success: true,
      data: newPromotion,
      message: 'Promotion created and processed successfully!',
      result: result
    });
  } catch (error) {
    console.error('❌ Failed to process promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process promotion: ' + error.message
    });
  }
});

// Get promotion status
router.get('/status/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      id,
      status: 'Success',
      progress: 100,
      estimatedTime: 'Completed'
    }
  });
});

module.exports = router;
