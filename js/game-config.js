// Game Configuration - BirdBird 2.6 - Fixed and Optimized
const GameConfig = {
  // Canvas dimensions
  CANVAS_WIDTH: 320,
  CANVAS_HEIGHT: 480,
  
  // Bird properties
  BIRD: {
    X: 80,
    Y: 240,
    START_Y: 240,
    WIDTH: 34,
    HEIGHT: 24,
    GRAVITY: 0.4,
    JUMP_FORCE: -6,
    MAX_VELOCITY: 15
  },
  
  // Pipe properties
  PIPE: {
    WIDTH: 52,
    GAP: 120,
    BASE_SPEED: 2,
    SPAWN_RATE: 90
  },
  
  // Performance settings optimized for all devices
  PERFORMANCE: {
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60, // 16.67ms
    MAX_DELTA_TIME: 32, // Cap delta time to prevent large jumps
    ENABLE_VSYNC: true
  },
  
  // Storage keys
  STORAGE: {
    HIGH_SCORE: 'birdbird-high-score-v26',
    SETTINGS: 'birdbird-settings-v26',
    LEADERBOARD: 'birdbird-leaderboard-v26'
  },
  
  // Audio settings
  AUDIO: {
    VOLUME: 0.5,
    ENABLED: true
  },
  
  // Difficulty settings - Fixed structure
  DIFFICULTY: {
    easy: {
      pipeGap: 140,
      speed: 1.5,
      spawnRate: 100
    },
    normal: {
      pipeGap: 120,
      speed: 2,
      spawnRate: 90
    },
    hard: {
      pipeGap: 100,
      speed: 2.5,
      spawnRate: 80
    }
  }
};

// Game Settings - User configurable with proper defaults
const GameSettings = {
  gameSpeed: 1.0,
  soundEnabled: true,
  difficulty: 'normal',
  showFPS: false,
  
  // Load settings from localStorage
  load() {
    try {
      const saved = localStorage.getItem(GameConfig.STORAGE.SETTINGS);
      if (saved) {
        const settings = JSON.parse(saved);
        // Ensure all properties exist with defaults
        this.gameSpeed = settings.gameSpeed || 1.0;
        this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        this.difficulty = settings.difficulty || 'normal';
        this.showFPS = settings.showFPS || false;
        
        // Validate difficulty exists
        if (!GameConfig.DIFFICULTY[this.difficulty]) {
          this.difficulty = 'normal';
        }
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
      this.reset();
    }
  },
  
  // Save settings to localStorage
  save() {
    try {
      const settings = {
        gameSpeed: this.gameSpeed,
        soundEnabled: this.soundEnabled,
        difficulty: this.difficulty,
        showFPS: this.showFPS
      };
      localStorage.setItem(GameConfig.STORAGE.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },
  
  // Reset to defaults
  reset() {
    this.gameSpeed = 1.0;
    this.soundEnabled = true;
    this.difficulty = 'normal';
    this.showFPS = false;
    this.save();
  },
  
  // Get current difficulty settings
  getCurrentDifficulty() {
    return GameConfig.DIFFICULTY[this.difficulty] || GameConfig.DIFFICULTY.normal;
  }
};

// Load settings on initialization
GameSettings.load();

