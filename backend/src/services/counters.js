const fs = require('fs');
const path = require('path');

class CounterService {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/counters.json');
    this.ensureDataFile();
    this.loadCounters();
  }

  ensureDataFile() {
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.dataFile)) {
      const initialData = {
        tokensPromoted: 1247,
        activeUsers: 50000,
        todayPromotions: 89,
        lastUpdate: {
          tokensPromoted: Date.now(),
          activeUsers: Date.now(),
          todayPromotions: Date.now()
        }
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(initialData, null, 2));
    }
  }

  loadCounters() {
    try {
      const data = fs.readFileSync(this.dataFile, 'utf8');
      this.counters = JSON.parse(data);
    } catch (error) {
      console.error('Error loading counters:', error);
      this.counters = {
        tokensPromoted: 1247,
        activeUsers: 50000,
        todayPromotions: 89,
        lastUpdate: {
          tokensPromoted: Date.now(),
          activeUsers: Date.now(),
          todayPromotions: Date.now()
        }
      };
    }
  }

  saveCounters() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.counters, null, 2));
    } catch (error) {
      console.error('Error saving counters:', error);
    }
  }

  updateTokensPromoted() {
    const now = Date.now();
    const lastUpdate = this.counters.lastUpdate.tokensPromoted;
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate >= 1) {
      const increase = Math.floor(hoursSinceUpdate) * 5;
      this.counters.tokensPromoted += increase;
      this.counters.lastUpdate.tokensPromoted = now;
      this.saveCounters();
      console.log(`📈 Tokens promoted updated: +${increase} (${hoursSinceUpdate.toFixed(1)} hours)`);
    }
  }

  updateActiveUsers() {
    const now = Date.now();
    const lastUpdate = this.counters.lastUpdate.activeUsers;
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate >= 1) {
      const increase = Math.floor(daysSinceUpdate) * 1000;
      this.counters.activeUsers += increase;
      this.counters.lastUpdate.activeUsers = now;
      this.saveCounters();
      console.log(`👥 Active users updated: +${increase} (${daysSinceUpdate.toFixed(1)} days)`);
    }
  }

  updateTodayPromotions() {
    const now = Date.now();
    const lastUpdate = this.counters.lastUpdate.todayPromotions;
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate >= 1) {
      // Randomize between 50 and 200
      this.counters.todayPromotions = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
      this.counters.lastUpdate.todayPromotions = now;
      this.saveCounters();
      console.log(`📊 Today's promotions updated: ${this.counters.todayPromotions} (new random value)`);
    }
  }

  getCounters() {
    // Update all counters before returning
    this.updateTokensPromoted();
    this.updateActiveUsers();
    this.updateTodayPromotions();
    
    return {
      totalPromoted: this.counters.tokensPromoted,
      activeUsers: this.counters.activeUsers,
      todayPromotions: this.counters.todayPromotions
    };
  }

  // Method to manually trigger a promotion (for testing)
  addPromotion() {
    this.counters.tokensPromoted += 1;
    this.counters.todayPromotions += 1;
    this.saveCounters();
    console.log('🎉 Promotion added manually');
  }
}

module.exports = new CounterService();
