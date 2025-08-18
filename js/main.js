// Main Application - Initializes and coordinates all game systems
class BirdBirdGame {
  constructor() {
    this.gameEngine = null;
    this.audioManager = null;
    this.leaderboardManager = null;
    this.uiManager = null;
    
    this.init();
  }
  
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // Initialize managers
      this.audioManager = new AudioManager();
      this.leaderboardManager = new LeaderboardManager();
      
      // Get canvas element
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) {
        throw new Error('Game canvas not found');
      }
      
      // Initialize game engine
      this.gameEngine = new GameEngine(canvas);
      
      // Initialize UI manager
      this.uiManager = new UIManager(this.gameEngine, this.audioManager, this.leaderboardManager);
      
      // Setup game events
      this.setupGameEvents();
      
      // Show start overlay
      this.showStartScreen();
      
      console.log('BirdBird Game initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load game. Please refresh the page.');
    }
  }
  
  setupGameEvents() {
    // Create global game events object for communication between systems
    window.gameEvents = {
      onScore: (score) => {
        this.audioManager.play('score');
        this.uiManager.updateUI();
      },
      
      onFlap: () => {
        this.audioManager.play('flap');
      },
      
      onGameOver: (score, highScore) => {
        this.audioManager.play(score > 0 ? 'hit' : 'die');
        this.uiManager.showGameOver();
        this.uiManager.updateUI();
      }
    };
  }
  
  showStartScreen() {
    const startOverlay = document.getElementById('overlayStart');
    if (startOverlay) {
      startOverlay.classList.remove('hidden');
    }
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 1000;
      text-align: center;
      font-family: system-ui, sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
  }
  
  // Public API methods
  getGameState() {
    return {
      state: this.gameEngine?.state,
      score: this.gameEngine?.score,
      highScore: this.gameEngine?.highScore
    };
  }
  
  pauseGame() {
    this.gameEngine?.pause();
  }
  
  resumeGame() {
    this.gameEngine?.resume();
  }
  
  resetGame() {
    this.gameEngine?.reset();
  }
}

// Initialize the game when the script loads
const game = new BirdBirdGame();

// Expose game instance globally for debugging
window.BirdBirdGame = game;

