// Leaderboard Manager - BirdBird 2.6 - Enhanced
class LeaderboardManager {
  constructor() {
    this.scores = this.loadScores();
  }
  
  loadScores() {
    try {
      const saved = localStorage.getItem(GameConfig.STORAGE.LEADERBOARD);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load leaderboard:', e);
      return [];
    }
  }
  
  saveScores() {
    try {
      localStorage.setItem(GameConfig.STORAGE.LEADERBOARD, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Failed to save leaderboard:', e);
    }
  }
  
  addScore(playerName, score) {
    if (!playerName || score < 0) return false;
    
    const newScore = {
      name: playerName.trim().substring(0, 16), // Limit name length
      score: score,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    
    this.scores.push(newScore);
    this.scores.sort((a, b) => b.score - a.score); // Sort by score descending
    this.scores = this.scores.slice(0, 10); // Keep only top 10
    
    this.saveScores();
    this.updateDisplay();
    
    return true;
  }
  
  clearScores() {
    this.scores = [];
    this.saveScores();
    this.updateDisplay();
  }
  
  updateDisplay() {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (this.scores.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
          No scores yet. Play the game to set a record!
        </td>
      `;
      tbody.appendChild(row);
      return;
    }
    
    this.scores.forEach((score, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-color)';
      row.style.transition = 'background-color 0.3s ease';
      
      // Add hover effect
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = 'rgba(100, 255, 218, 0.1)';
      });
      
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = 'transparent';
      });
      
      // Add medal emoji for top 3
      let rankDisplay = index + 1;
      if (index === 0) rankDisplay = '🥇';
      else if (index === 1) rankDisplay = '🥈';
      else if (index === 2) rankDisplay = '🥉';
      
      row.innerHTML = `
        <td style="padding: 0.75rem; color: var(--text-primary); font-weight: ${index < 3 ? 'bold' : 'normal'};">${rankDisplay}</td>
        <td style="padding: 0.75rem; color: var(--text-primary); font-weight: ${index < 3 ? 'bold' : 'normal'};">${this.escapeHtml(score.name)}</td>
        <td style="padding: 0.75rem; color: var(--accent-primary); font-weight: bold; font-size: ${index < 3 ? '1.1em' : '1em'};">${score.score}</td>
        <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.9em;">${score.date}</td>
      `;
      
      tbody.appendChild(row);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  getTopScore() {
    return this.scores.length > 0 ? this.scores[0].score : 0;
  }
  
  isHighScore(score) {
    return this.scores.length < 10 || score > this.scores[this.scores.length - 1].score;
  }
  
  getRank(score) {
    if (this.scores.length === 0) return 1;
    
    let rank = 1;
    for (const savedScore of this.scores) {
      if (score > savedScore.score) {
        break;
      }
      rank++;
    }
    
    return rank;
  }
  
  getScoreStats() {
    if (this.scores.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0
      };
    }
    
    const totalScore = this.scores.reduce((sum, score) => sum + score.score, 0);
    
    return {
      totalGames: this.scores.length,
      averageScore: Math.round(totalScore / this.scores.length),
      bestScore: this.scores[0].score
    };
  }
}

