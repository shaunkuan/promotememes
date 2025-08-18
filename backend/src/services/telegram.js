const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    this.bot = null;
    this.isConfigured = false;
    this.chatId = null;
  }

  configure(botToken, chatId) {
    try {
      this.bot = new TelegramBot(botToken);
      this.chatId = chatId;
      this.isConfigured = true;
      console.log('✅ Telegram service configured successfully');
    } catch (error) {
      console.error('❌ Telegram service configuration failed:', error.message);
      this.isConfigured = false;
    }
  }

  async postMessage(message) {
    if (!this.isConfigured || !this.bot) {
      console.log('📝 Mock Telegram post:', message);
      return {
        success: true,
        id: 'mock_telegram_' + Date.now(),
        text: message
      };
    }

    try {
      const sentMessage = await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
      console.log('✅ Telegram message posted successfully:', sentMessage.message_id);
      return {
        success: true,
        id: sentMessage.message_id,
        text: message
      };
    } catch (error) {
      console.error('❌ Failed to post Telegram message:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateMessage(tokenData, plan) {
    const { symbol, marketCap, price } = tokenData;
    
    if (plan === 'Advanced') {
      return `🚀 <b>$${symbol}</b> just hit <b>${marketCap}</b> market cap!

🔥 Don't miss the next moonshot! 

💰 Price: ${price}
📈 Market Cap: ${marketCap}

#Solana #Crypto #Degen #MemeCoin`;
    } else {
      return `💎 <b>$${symbol}</b> trending! 

⚡ Quick pump alert!
💰 Market Cap: ${marketCap}

#Solana #Crypto #Degen #MemeCoin`;
    }
  }
}

module.exports = new TelegramService();
