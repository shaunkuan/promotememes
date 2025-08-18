const { Client, GatewayIntentBits } = require('discord.js');

class DiscordService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.channelId = null;
  }

  configure(botToken, channelId) {
    try {
      this.client = new Client({ 
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
      });
      this.channelId = channelId;
      
      this.client.login(botToken);
      this.isConfigured = true;
      console.log('✅ Discord service configured successfully');
    } catch (error) {
      console.error('❌ Discord service configuration failed:', error.message);
      this.isConfigured = false;
    }
  }

  async postMessage(message) {
    if (!this.isConfigured || !this.client) {
      console.log('📝 Mock Discord post:', message);
      return {
        success: true,
        id: 'mock_discord_' + Date.now(),
        text: message
      };
    }

    try {
      const channel = await this.client.channels.fetch(this.channelId);
      const sentMessage = await channel.send(message);
      console.log('✅ Discord message posted successfully:', sentMessage.id);
      return {
        success: true,
        id: sentMessage.id,
        text: message
      };
    } catch (error) {
      console.error('❌ Failed to post Discord message:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateMessage(tokenData, plan) {
    const { symbol, marketCap, price } = tokenData;
    
    if (plan === 'Advanced') {
      return `🚀 **$${symbol}** just hit **${marketCap}** market cap!

🔥 Don't miss the next moonshot! 

💰 Price: ${price}
📈 Market Cap: ${marketCap}

#Solana #Crypto #Degen #MemeCoin`;
    } else {
      return `💎 **$${symbol}** trending! 

⚡ Quick pump alert!
💰 Market Cap: ${marketCap}

#Solana #Crypto #Degen #MemeCoin`;
    }
  }
}

module.exports = new DiscordService();
