// Main Application - BirdBird 2.6 - Fixed and Optimized
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
      
      // Setup ads with improved error handling
      this.setupAds();
      
      console.log('BirdBird 2.6 initialized successfully');
      
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
      },
      
      onGameStart: () => {
        // Game started
      }
    };
  }
  
  setupAds() {
    // Setup Adsterra ads with improved error handling
    try {
      this.loadAdsterraAd('adsterra-top');
      
      // Add more ad placements with delay to prevent conflicts
      setTimeout(() => {
        this.loadAdsterraAd('adsterra-left');
        this.loadAdsterraAd('adsterra-right');
        this.loadAdsterraAd('adsterra-bottom');
      }, 1000);
    } catch (error) {
      console.warn('Failed to setup ads:', error);
    }
  }
  
  loadAdsterraAd(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // Create a unique ad container with better structure
      const adId = `ad-${containerId}-${Date.now()}`;
      
      // Replace placeholder with actual Adsterra ad code
      container.innerHTML = `
        <div id="${adId}" style="text-align: center; margin: 10px 0; min-height: 60px;">
          <div class="ad-content">
            <!-- Adsterra Ad Code -->
            <script type="text/javascript">
              (function() {
                try {
                  var atOptions = {
                    'key' : '2c9e3e07b7fa2238b26a25f1085e6e26',
                    'format' : 'iframe',
                    'height' : 60,
                    'width' : 468,
                    'params' : {}
                  };
                  
                  var script = document.createElement('script');
                  script.type = 'text/javascript';
                  script.src = '//www.highperformanceformat.com/2c9e3e07b7fa2238b26a25f1085e6e26/invoke.js';
                  script.onerror = function() {
                    console.warn('Failed to load Adsterra script for ${containerId}');
                  };
                  document.head.appendChild(script);
                } catch (e) {
                  console.warn('Error setting up ad for ${containerId}:', e);
                }
              })();
            </script>
          </div>
          <noscript>
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; color: var(--text-muted); border: 1px dashed var(--border-color);">
              Advertisement (JavaScript required)
            </div>
          </noscript>
        </div>
      `;
      
    } catch (e) {
      console.warn('Failed to load ad for', containerId, e);
      // Fallback to styled placeholder
      container.innerHTML = `
        <div style="background: var(--bg-tertiary); border: 2px dashed var(--border-color); border-radius: 10px; padding: 1rem; text-align: center; color: var(--text-muted); min-height: 60px; display: flex; align-items: center; justify-content: center;">
          <span>Advertisement Space - ${containerId.replace('adsterra-', '').replace('-', ' ').toUpperCase()}</span>
        </div>
      `;
    }
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 2rem;
      border-radius: 15px;
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 40px var(--shadow-color);
      z-index: 1000;
      text-align: center;
      max-width: 90vw;
      backdrop-filter: blur(10px);
    `;
    
    errorDiv.innerHTML = `
      <h3 style="color: var(--accent-secondary); margin-bottom: 1rem;">Error</h3>
      <p style="margin-bottom: 1.5rem;">${message}</p>
      <button onclick="location.reload()" style="
        background: linear-gradient(135deg, var(--accent-primary) 0%, #4ecdc4 100%);
        color: var(--bg-primary);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      ">Reload Page</button>
    `;
    
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

// Handle page visibility changes to pause/resume game
document.addEventListener('visibilitychange', () => {
  if (game.gameEngine) {
    if (document.hidden) {
      game.pauseGame();
    } else if (game.gameEngine.state === 'paused') {
      game.resumeGame();
    }
  }
});

// Enhanced mobile optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Prevent iOS bounce effect
  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Prevent context menu on long press
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.game-container')) {
      e.preventDefault();
    }
  });
  
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (game.gameEngine) {
        game.gameEngine.fitCanvas();
      }
    }, 100);
  });
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
  performance.mark('birdbird-init-start');
  
  window.addEventListener('load', () => {
    performance.mark('birdbird-init-end');
    performance.measure('birdbird-init', 'birdbird-init-start', 'birdbird-init-end');
  });
}

