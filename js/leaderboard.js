// Leaderboard Manager - Handles local leaderboard functionality
class LeaderboardManager {
  constructor() {
    this.maxEntries = 10;
  }
  
  getLeaderboard() {
    try {
      const data = localStorage.getItem(GameConfig.STORAGE.LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
      return [];
    }
  }
  
  saveLeaderboard(entries) {
    try {
      localStorage.setItem(GameConfig.STORAGE.LEADERBOARD, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save leaderboard:', error);
    }
  }
  
  addScore(playerName, score) {
    const entries = this.getLeaderboard();
    
    const newEntry = {
      name: this.sanitizeName(playerName),
      score: score,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    entries.push(newEntry);
    
    // Sort by score (highest first) and keep only top entries
    entries.sort((a, b) => b.score - a.score);
    const topEntries = entries.slice(0, this.maxEntries);
    
    this.saveLeaderboard(topEntries);
    return topEntries;
  }
  
  clearLeaderboard() {
    try {
      localStorage.removeItem(GameConfig.STORAGE.LEADERBOARD);
    } catch (error) {
      console.warn('Failed to clear leaderboard:', error);
    }
  }
  
  sanitizeName(name) {
    if (!name || typeof name !== 'string') {
      return 'Anonymous';
    }
    
    // Remove HTML tags and limit length
    return name
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 16) || 'Anonymous';
  }
  
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  }
  
  renderLeaderboard(containerElement) {
    const entries = this.getLeaderboard();
    
    if (!containerElement) {
      console.warn('Leaderboard container element not found');
      return;
    }
    
    if (entries.length === 0) {
      containerElement.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--muted); padding: 20px;">
            No scores yet. Be the first to play!
          </td>
        </tr>
      `;
      return;
    }
    
    containerElement.innerHTML = entries
      .map((entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${this.escapeHtml(entry.name)}</td>
          <td>${entry.score}</td>
          <td>${this.formatDate(entry.date)}</td>
        </tr>
      `)
      .join('');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  isHighScore(score) {
    const entries = this.getLeaderboard();
    if (entries.length < this.maxEntries) {
      return true;
    }
    
    const lowestScore = entries[entries.length - 1].score;
    return score > lowestScore;
  }
  
  getRank(score) {
    const entries = this.getLeaderboard();
    const betterScores = entries.filter(entry => entry.score > score).length;
    return betterScores + 1;
  }
}

