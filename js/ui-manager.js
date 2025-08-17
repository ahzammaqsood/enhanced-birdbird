// UI Manager - Handles all user interface interactions
class UIManager {
  constructor(gameEngine, audioManager, leaderboardManager) {
    this.game = gameEngine;
    this.audio = audioManager;
    this.leaderboard = leaderboardManager;
    
    this.elements = this.getElements();
    this.setupEventListeners();
    this.setupNavigation();
    this.setupMobileMenu();
    this.updateUI();
    this.loadStatistics();
  }
  
  getElements() {
    return {
      // Game elements
      canvas: document.getElementById('gameCanvas'),
      overlayStart: document.getElementById('overlayStart'),
      overlayGameOver: document.getElementById('overlayGameOver'),
      overlaySettings: document.getElementById('overlaySettings'),
      
      // Buttons
      btnStart: document.getElementById('btnStart'),
      btnRestart: document.getElementById('btnRestart'),
      btnSettings: document.getElementById('btnSettings'),
      btnSettings2: document.getElementById('btnSettings2'),
      btnCloseSettings: document.getElementById('btnCloseSettings'),
      btnResetSettings: document.getElementById('btnResetSettings'),
      
      // Score elements
      scoreDisplay: document.getElementById('score'),
      highScoreDisplay: document.getElementById('highScore'),
      finalScoreDisplay: document.getElementById('finalScore'),
      finalHighScoreDisplay: document.getElementById('finalHighScore'),
      
      // Leaderboard
      leaderboardBody: document.getElementById('leaderboardBody'),
      clearBoardBtn: document.getElementById('clearBoard'),
      saveScoreForm: document.getElementById('saveScoreForm'),
      playerNameInput: document.getElementById('playerName'),
      
      // Settings
      gameSpeedSlider: document.getElementById('gameSpeed'),
      gameSpeedValue: document.getElementById('gameSpeedValue'),
      soundToggle: document.getElementById('soundToggle'),
      difficultySelect: document.getElementById('difficulty'),
      showFpsToggle: document.getElementById('showFps'),
      
      // Navigation
      navLinks: document.querySelectorAll('.nav-link'),
      sections: document.querySelectorAll('.section'),
      
      // Mobile menu
      hamburger: document.querySelector('.hamburger'),
      mobileDrawer: document.getElementById('mobileDrawer'),
      drawerClose: document.querySelector('.drawer-close'),
      
      // Statistics
      totalGamesPlayed: document.getElementById('totalGamesPlayed'),
      totalScore: document.getElementById('totalScore'),
      averageScore: document.getElementById('averageScore'),
      bestStreak: document.getElementById('bestStreak')
    };
  }
  
  setupEventListeners() {
    // Game controls
    this.elements.btnStart?.addEventListener('click', () => this.startGame());
    this.elements.btnRestart?.addEventListener('click', () => this.startGame());
    this.elements.btnSettings?.addEventListener('click', () => this.showSettings());
    this.elements.btnSettings2?.addEventListener('click', () => this.showSettings());
    this.elements.btnCloseSettings?.addEventListener('click', () => this.hideSettings());
    this.elements.btnResetSettings?.addEventListener('click', () => this.resetSettings());
    
    // Input controls
    this.elements.canvas?.addEventListener('pointerdown', (e) => this.handlePointerInput(e));
    window.addEventListener('keydown', (e) => this.handleKeyInput(e));
    
    // Leaderboard
    this.elements.clearBoardBtn?.addEventListener('click', () => this.clearLeaderboard());
    this.elements.saveScoreForm?.addEventListener('submit', (e) => this.saveScore(e));
    
    // Settings
    this.elements.gameSpeedSlider?.addEventListener('input', (e) => this.updateGameSpeed(e));
    this.elements.soundToggle?.addEventListener('change', (e) => this.toggleSound(e));
    this.elements.difficultySelect?.addEventListener('change', (e) => this.changeDifficulty(e));
    this.elements.showFpsToggle?.addEventListener('change', (e) => this.toggleFPS(e));
    
    // Focus management
    this.elements.canvas.tabIndex = 0;
    this.elements.canvas.addEventListener('focus', () => {}, { once: true });
  }
  
  setupNavigation() {
    // Hash-based navigation
    const activateSection = (hash) => {
      this.elements.sections.forEach(section => {
        section.classList.toggle('active', `#${section.id}` === hash);
      });
      
      this.elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
      });
      
      if (!hash || hash === '#home') {
        history.replaceState(null, '', '#home');
      }
    };
    
    window.addEventListener('hashchange', () => {
      activateSection(location.hash || '#home');
    });
    
    activateSection(location.hash || '#home');
  }
  
  setupMobileMenu() {
    const toggleDrawer = (open) => {
      this.elements.mobileDrawer?.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('no-scroll', open);
      this.elements.hamburger?.setAttribute('aria-expanded', String(open));
    };
    
    this.elements.hamburger?.addEventListener('click', () => toggleDrawer(true));
    this.elements.drawerClose?.addEventListener('click', () => toggleDrawer(false));
    
    this.elements.mobileDrawer?.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) {
        toggleDrawer(false);
      }
    });
  }
  
  handlePointerInput(e) {
    e.preventDefault();
    this.game.flap();
  }
  
  handleKeyInput(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      this.game.flap();
    } else if (e.key === 'Escape') {
      if (this.game.state === 'playing') {
        this.pauseGame();
      } else if (this.elements.overlaySettings && !this.elements.overlaySettings.classList.contains('hidden')) {
        this.hideSettings();
      }
    }
  }
  
  startGame() {
    this.hideAllOverlays();
    this.game.reset();
    this.elements.canvas?.focus();
  }
  
  pauseGame() {
    this.game.pause();
    this.showSettings();
  }
  
  showSettings() {
    this.elements.overlaySettings?.classList.remove('hidden');
    this.loadSettingsUI();
  }
  
  hideSettings() {
    this.elements.overlaySettings?.classList.add('hidden');
    if (this.game.state === 'paused') {
      this.game.resume();
    }
  }
  
  hideAllOverlays() {
    this.elements.overlayStart?.classList.add('hidden');
    this.elements.overlayGameOver?.classList.add('hidden');
    this.elements.overlaySettings?.classList.add('hidden');
  }
  
  updateUI() {
    // Update score displays
    if (this.elements.scoreDisplay) {
      this.elements.scoreDisplay.textContent = String(this.game.score);
    }
    
    if (this.elements.highScoreDisplay) {
      this.elements.highScoreDisplay.textContent = String(this.game.highScore);
    }
    
    // Update leaderboard
    this.leaderboard.renderLeaderboard(this.elements.leaderboardBody);
  }
  
  showGameOver() {
    if (this.elements.finalScoreDisplay) {
      this.elements.finalScoreDisplay.textContent = String(this.game.score);
    }
    
    if (this.elements.finalHighScoreDisplay) {
      this.elements.finalHighScoreDisplay.textContent = String(this.game.highScore);
    }
    
    this.elements.overlayGameOver?.classList.remove('hidden');
    
    // Focus on name input if it's a high score
    if (this.leaderboard.isHighScore(this.game.score)) {
      setTimeout(() => {
        this.elements.playerNameInput?.focus();
      }, 100);
    }
    
    // Update statistics
    this.updateStatistics();
  }
  
  saveScore(e) {
    e.preventDefault();
    
    const playerName = this.elements.playerNameInput?.value.trim() || 'Anonymous';
    this.leaderboard.addScore(playerName, this.game.score);
    
    // Clear input and hide overlay
    if (this.elements.playerNameInput) {
      this.elements.playerNameInput.value = '';
    }
    
    this.elements.overlayGameOver?.classList.add('hidden');
    this.updateUI();
    
    // Navigate to leaderboard
    window.location.hash = '#leaderboard';
  }
  
  clearLeaderboard() {
    if (confirm('Are you sure you want to clear the leaderboard? This action cannot be undone.')) {
      this.leaderboard.clearLeaderboard();
      this.updateUI();
    }
  }
  
  loadSettingsUI() {
    // Load current settings into UI
    if (this.elements.gameSpeedSlider) {
      this.elements.gameSpeedSlider.value = GameSettings.gameSpeed;
      this.updateGameSpeedDisplay();
    }
    
    if (this.elements.soundToggle) {
      this.elements.soundToggle.checked = GameSettings.soundEnabled;
    }
    
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.value = GameSettings.difficulty;
    }
    
    if (this.elements.showFpsToggle) {
      this.elements.showFpsToggle.checked = GameSettings.showFPS;
    }
  }
  
  updateGameSpeed(e) {
    GameSettings.gameSpeed = parseFloat(e.target.value);
    GameSettings.save();
    this.updateGameSpeedDisplay();
  }
  
  updateGameSpeedDisplay() {
    if (this.elements.gameSpeedValue) {
      this.elements.gameSpeedValue.textContent = `${(GameSettings.gameSpeed * 100).toFixed(0)}%`;
    }
  }
  
  toggleSound(e) {
    GameSettings.soundEnabled = e.target.checked;
    this.audio.setEnabled(GameSettings.soundEnabled);
    GameSettings.save();
  }
  
  changeDifficulty(e) {
    GameSettings.difficulty = e.target.value;
    GameSettings.applyDifficulty();
    GameSettings.save();
  }
  
  toggleFPS(e) {
    GameSettings.showFPS = e.target.checked;
    GameSettings.save();
  }
  
  resetSettings() {
    if (confirm('Reset all settings to default values?')) {
      // Reset to default values
      GameSettings.gameSpeed = 1.0;
      GameSettings.soundEnabled = true;
      GameSettings.difficulty = 'normal';
      GameSettings.showFPS = false;
      
      // Apply and save
      GameSettings.applyDifficulty();
      GameSettings.save();
      
      // Update UI
      this.loadSettingsUI();
      
      // Update audio manager
      this.audio.setEnabled(GameSettings.soundEnabled);
    }
  }
  
  updateStatistics() {
    try {
      // Get current statistics from localStorage
      const stats = JSON.parse(localStorage.getItem('birdbird_statistics') || '{}');
      
      // Update statistics
      stats.totalGamesPlayed = (stats.totalGamesPlayed || 0) + 1;
      stats.totalScore = (stats.totalScore || 0) + this.game.score;
      stats.averageScore = Math.round(stats.totalScore / stats.totalGamesPlayed);
      
      // Update best streak (consecutive games with score > 0)
      if (this.game.score > 0) {
        stats.currentStreak = (stats.currentStreak || 0) + 1;
        stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
      } else {
        stats.currentStreak = 0;
      }
      
      // Save statistics
      localStorage.setItem('birdbird_statistics', JSON.stringify(stats));
      
      // Update UI elements
      if (this.elements.totalGamesPlayed) {
        this.elements.totalGamesPlayed.textContent = stats.totalGamesPlayed;
      }
      if (this.elements.totalScore) {
        this.elements.totalScore.textContent = stats.totalScore;
      }
      if (this.elements.averageScore) {
        this.elements.averageScore.textContent = stats.averageScore;
      }
      if (this.elements.bestStreak) {
        this.elements.bestStreak.textContent = stats.bestStreak;
      }
    } catch (error) {
      console.warn('Failed to update statistics:', error);
    }
  }
  
  loadStatistics() {
    try {
      const stats = JSON.parse(localStorage.getItem('birdbird_statistics') || '{}');
      
      if (this.elements.totalGamesPlayed) {
        this.elements.totalGamesPlayed.textContent = stats.totalGamesPlayed || 0;
      }
      if (this.elements.totalScore) {
        this.elements.totalScore.textContent = stats.totalScore || 0;
      }
      if (this.elements.averageScore) {
        this.elements.averageScore.textContent = stats.averageScore || 0;
      }
      if (this.elements.bestStreak) {
        this.elements.bestStreak.textContent = stats.bestStreak || 0;
      }
    } catch (error) {
      console.warn('Failed to load statistics:', error);
    }
  }
}

