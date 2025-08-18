const { TwitterApi } = require('twitter-api-v2');

class TwitterService {
  constructor() {
    // Initialize Twitter client (will be configured with real credentials)
    this.client = null;
    this.isConfigured = false;
  }

  configure(apiKey, apiSecret, accessToken, accessSecret) {
    try {
      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
      this.isConfigured = true;
      console.log('✅ Twitter service configured successfully');
    } catch (error) {
      console.error('❌ Twitter service configuration failed:', error.message);
      this.isConfigured = false;
    }
  }

  async postTweet(caption) {
    if (!this.isConfigured || !this.client) {
      console.log('�� Mock Twitter post:', caption);
      return {
        success: true,
        id: 'mock_tweet_' + Date.now(),
        text: caption
      };
    }

    try {
      const tweet = await this.client.v2.tweet(caption);
      console.log('✅ Tweet posted successfully:', tweet.data.id);
      return {
        success: true,
        id: tweet.data.id,
        text: caption
      };
    } catch (error) {
      console.error('❌ Failed to post tweet:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateCaption(tokenData, plan) {
    const { symbol, marketCap, price } = tokenData;
    const hashtags = '#Solana #Crypto #Degen #MemeCoin';
    
    if (plan === 'Advanced') {
      return `🚀 $${symbol} just hit ${marketCap} market cap! 
      
🔥 Don't miss the next moonshot! 
${hashtags}

#Solana #Crypto #Degen #MemeCoin`;
    } else {
      return `💎 $${symbol} trending! Market cap: ${marketCap}
      
⚡ Quick pump alert! 
${hashtags}`;
    }
  }
}

module.exports = new TwitterService();
