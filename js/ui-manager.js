// UI Manager - BirdBird 2.6 - Enhanced and Responsive
class UIManager {
  constructor(gameEngine, audioManager, leaderboardManager) {
    this.gameEngine = gameEngine;
    this.audioManager = audioManager;
    this.leaderboardManager = leaderboardManager;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateUI();
    this.leaderboardManager.updateDisplay();
    this.loadSettings();
    this.setupResponsiveHandlers();
  }
  
  setupEventListeners() {
    // Start game button
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.audioManager.initializeAudioContext();
        this.gameEngine.startGame();
      });
    }
    
    // Settings button
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.showSettings();
      });
    }
    
    // Restart button
    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.hideGameOver();
        this.gameEngine.startGame();
      });
    }
    
    // Back to menu button
    const btnBackToMenu = document.getElementById('btnBackToMenu');
    if (btnBackToMenu) {
      btnBackToMenu.addEventListener('click', () => {
        this.hideGameOver();
        this.showStart();
      });
    }
    
    // Save score button
    const btnSaveScore = document.getElementById('btnSaveScore');
    if (btnSaveScore) {
      btnSaveScore.addEventListener('click', () => {
        this.saveScore();
      });
    }
    
    // Settings controls
    this.setupSettingsControls();
    
    // Clear leaderboard button
    const clearBoard = document.getElementById('clearBoard');
    if (clearBoard) {
      clearBoard.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the leaderboard?')) {
          this.leaderboardManager.clearScores();
          this.showNotification('Leaderboard cleared!', 'success');
        }
      });
    }
    
    // Mobile menu
    this.setupMobileMenu();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  setupSettingsControls() {
    // Game speed slider
    const gameSpeed = document.getElementById('gameSpeed');
    const gameSpeedValue = document.getElementById('gameSpeedValue');
    if (gameSpeed && gameSpeedValue) {
      gameSpeed.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        GameSettings.gameSpeed = value;
        gameSpeedValue.textContent = Math.round(value * 100) + '%';
        GameSettings.save();
      });
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        GameSettings.soundEnabled = e.target.checked;
        this.audioManager.setEnabled(e.target.checked);
        GameSettings.save();
        
        if (e.target.checked) {
          this.audioManager.initializeAudioContext();
          this.showNotification('Sound enabled', 'success');
        } else {
          this.showNotification('Sound disabled', 'info');
        }
      });
    }
    
    // Difficulty select
    const difficulty = document.getElementById('difficulty');
    if (difficulty) {
      difficulty.addEventListener('change', (e) => {
        GameSettings.difficulty = e.target.value;
        GameSettings.save();
        this.showNotification(`Difficulty set to ${e.target.value}`, 'info');
      });
    }
    
    // Show FPS toggle
    const showFps = document.getElementById('showFps');
    if (showFps) {
      showFps.addEventListener('change', (e) => {
        GameSettings.showFPS = e.target.checked;
        GameSettings.save();
      });
    }
    
    // Close settings button
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        this.hideSettings();
      });
    }
    
    // Reset settings button
    const btnResetSettings = document.getElementById('btnResetSettings');
    if (btnResetSettings) {
      btnResetSettings.addEventListener('click', () => {
        if (confirm('Reset all settings to default?')) {
          GameSettings.reset();
          this.loadSettings();
          this.showNotification('Settings reset to default', 'success');
        }
      });
    }
  }
  
  setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
      mobileMenuBtn.addEventListener('click', () => {
        const isVisible = nav.style.display === 'flex';
        
        if (isVisible) {
          nav.style.display = 'none';
        } else {
          nav.style.display = 'flex';
          nav.style.position = 'absolute';
          nav.style.top = '100%';
          nav.style.left = '0';
          nav.style.right = '0';
          nav.style.background = 'var(--bg-secondary)';
          nav.style.flexDirection = 'column';
          nav.style.padding = '1rem';
          nav.style.borderTop = '1px solid var(--border-color)';
          nav.style.zIndex = '1000';
          nav.style.boxShadow = '0 10px 30px var(--shadow-color)';
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-content')) {
          nav.style.display = 'none';
        }
      });
    }
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ESC to close modals
      if (e.key === 'Escape') {
        this.hideSettings();
        this.hideGameOver();
      }
      
      // Enter to start game or restart
      if (e.key === 'Enter') {
        if (this.gameEngine.state === 'start') {
          this.gameEngine.startGame();
        } else if (this.gameEngine.state === 'gameOver') {
          this.hideGameOver();
          this.gameEngine.startGame();
        }
      }
    });
  }
  
  setupResponsiveHandlers() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.adjustModalSizes();
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustModalSizes();
        if (this.gameEngine) {
          this.gameEngine.fitCanvas();
        }
      }, 100);
    });
  }
  
  adjustModalSizes() {
    const modals = document.querySelectorAll('.overlay-content');
    modals.forEach(modal => {
      const rect = modal.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Adjust for very small screens
      if (viewportWidth < 400) {
        modal.style.maxWidth = '95vw';
        modal.style.padding = '1rem';
      } else {
        modal.style.maxWidth = '90vw';
        modal.style.padding = '2rem';
      }
      
      // Adjust for very short screens
      if (viewportHeight < 600) {
        modal.style.maxHeight = '90vh';
        modal.style.overflowY = 'auto';
      }
    });
  }
  
  loadSettings() {
    // Load game speed
    const gameSpeed = document.getElementById('gameSpeed');
    const gameSpeedValue = document.getElementById('gameSpeedValue');
    if (gameSpeed && gameSpeedValue) {
      gameSpeed.value = GameSettings.gameSpeed;
      gameSpeedValue.textContent = Math.round(GameSettings.gameSpeed * 100) + '%';
    }
    
    // Load sound setting
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.checked = GameSettings.soundEnabled;
    }
    
    // Load difficulty
    const difficulty = document.getElementById('difficulty');
    if (difficulty) {
      difficulty.value = GameSettings.difficulty;
    }
    
    // Load FPS setting
    const showFps = document.getElementById('showFps');
    if (showFps) {
      showFps.checked = GameSettings.showFPS;
    }
  }
  
  updateUI() {
    // Update score displays
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    
    if (scoreElement) {
      scoreElement.textContent = this.gameEngine.score;
    }
    
    if (highScoreElement) {
      highScoreElement.textContent = this.gameEngine.highScore;
    }
  }
  
  showStart() {
    const startOverlay = document.getElementById('overlayStart');
    if (startOverlay) {
      startOverlay.classList.remove('hidden');
    }
  }
  
  showGameOver() {
    const gameOverOverlay = document.getElementById('overlayGameOver');
    const finalScore = document.getElementById('finalScore');
    const finalHighScore = document.getElementById('finalHighScore');
    
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('hidden');
    }
    
    if (finalScore) {
      finalScore.textContent = this.gameEngine.score;
    }
    
    if (finalHighScore) {
      finalHighScore.textContent = this.gameEngine.highScore;
    }
    
    // Show rank information
    const rank = this.leaderboardManager.getRank(this.gameEngine.score);
    if (rank <= 10) {
      this.showNotification(`You would rank #${rank} on the leaderboard!`, 'success');
    }
    
    // Focus on name input if it's a high score
    if (this.leaderboardManager.isHighScore(this.gameEngine.score)) {
      const playerName = document.getElementById('playerName');
      if (playerName) {
        setTimeout(() => {
          playerName.focus();
          playerName.select();
        }, 500);
      }
    }
  }
  
  hideGameOver() {
    const gameOverOverlay = document.getElementById('overlayGameOver');
    if (gameOverOverlay) {
      gameOverOverlay.classList.add('hidden');
    }
    
    // Clear player name input
    const playerName = document.getElementById('playerName');
    if (playerName) {
      playerName.value = '';
    }
  }
  
  showSettings() {
    const settingsOverlay = document.getElementById('overlaySettings');
    if (settingsOverlay) {
      settingsOverlay.classList.remove('hidden');
    }
  }
  
  hideSettings() {
    const settingsOverlay = document.getElementById('overlaySettings');
    if (settingsOverlay) {
      settingsOverlay.classList.add('hidden');
    }
  }
  
  saveScore() {
    const playerName = document.getElementById('playerName');
    if (!playerName || !playerName.value.trim()) {
      this.showNotification('Please enter your name to save the score.', 'warning');
      if (playerName) playerName.focus();
      return;
    }
    
    const success = this.leaderboardManager.addScore(
      playerName.value.trim(),
      this.gameEngine.score
    );
    
    if (success) {
      this.showNotification('Score saved successfully!', 'success');
      playerName.value = '';
      
      // Show updated rank
      const rank = this.leaderboardManager.getRank(this.gameEngine.score);
      setTimeout(() => {
        this.showNotification(`You are now ranked #${rank}!`, 'info');
      }, 1500);
    } else {
      this.showNotification('Failed to save score. Please try again.', 'error');
    }
  }
  
  showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Get icon based on type
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: 0 15px 35px var(--shadow-color);
      z-index: 1001;
      transform: translateX(100%);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 300px;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 1.2em;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, duration);
  }
}

