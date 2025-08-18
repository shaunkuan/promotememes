const twitterService = require('../services/twitter');
const discordService = require('../services/discord');
const telegramService = require('../services/telegram');

class PromotionProcessor {
  constructor() {
    this.isProcessing = false;
  }

  async processPromotion(promotionData) {
    const { tokenAddress, plan, twitterHandle } = promotionData;
    
    console.log(`🚀 Processing promotion for token: ${tokenAddress}`);
    console.log(`📋 Plan: ${plan}`);
    
    // Mock token data (in real app, this would come from Solana API)
    const tokenData = {
      symbol: 'DOGY',
      marketCap: '$23K',
      price: '$0.00005',
      address: tokenAddress
    };

    const results = {
      twitter: null,
      discord: null,
      telegram: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Post to Twitter
      console.log('📱 Posting to Twitter...');
      const twitterCaption = twitterService.generateCaption(tokenData, plan);
      results.twitter = await twitterService.postTweet(twitterCaption);

      // Post to Discord
      console.log('💬 Posting to Discord...');
      const discordMessage = discordService.generateMessage(tokenData, plan);
      results.discord = await discordService.postMessage(discordMessage);

      // Post to Telegram
      console.log('📲 Posting to Telegram...');
      const telegramMessage = telegramService.generateMessage(tokenData, plan);
      results.telegram = await telegramService.postMessage(telegramMessage);

      console.log('✅ Promotion completed successfully!');
      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('❌ Promotion failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: results
      };
    }
  }

  async schedulePromotion(promotionData) {
    const { plan } = promotionData;
    
    if (plan === 'Basic') {
      // Schedule for 10 minutes from now
      const delay = 10 * 60 * 1000; // 10 minutes in milliseconds
      setTimeout(() => {
        this.processPromotion(promotionData);
      }, delay);
      
      console.log(`⏰ Basic promotion scheduled for 10 minutes from now`);
    } else if (plan === 'Advanced') {
      // Schedule multiple posts over 3 hours
      const posts = [
        { delay: 0, message: 'Initial post' },
        { delay: 60 * 60 * 1000, message: '1 hour update' },
        { delay: 2 * 60 * 60 * 1000, message: '2 hour update' },
        { delay: 3 * 60 * 60 * 1000, message: 'Final post' }
      ];

      posts.forEach(({ delay, message }) => {
        setTimeout(() => {
          console.log(`⏰ Advanced promotion: ${message}`);
          this.processPromotion(promotionData);
        }, delay);
      });
      
      console.log(`⏰ Advanced promotion scheduled for 3 hours with 4 posts`);
    }
  }
}

module.exports = new PromotionProcessor();
