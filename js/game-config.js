// Game Configuration and Constants
const GameConfig = {
  // Canvas settings
  CANVAS_WIDTH: 320,
  CANVAS_HEIGHT: 480,
  
  // Bird settings
  BIRD: {
    X: 50,
    WIDTH: 24,
    HEIGHT: 21,
    GRAVITY: 0.2,
    JUMP_FORCE: -4,
    START_Y: 150
  },
  
  // Pipe settings
  PIPE: {
    WIDTH: 50,
    GAP: 120,
    SPAWN_INTERVAL: 120, // frames
    BASE_SPEED: 1.5,
    MIN_TOP: 50,
    MAX_TOP_OFFSET: 50
  },
  
  // Game mechanics
  DIFFICULTY: {
    SPEED_INCREASE_PER_SCORE: 10, // every 10 points, speed increases
    MAX_SPEED_MULTIPLIER: 3
  },
  
  // Performance settings
  PERFORMANCE: {
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60
  },
  
  // Audio settings
  AUDIO: {
    ENABLED: true,
    VOLUME: 0.5
  },
  
  // Storage keys
  STORAGE: {
    HIGH_SCORE: 'birdbird_high_score',
    LEADERBOARD: 'birdbird_leaderboard',
    SETTINGS: 'birdbird_settings'
  }
};

// Game settings that can be modified by user
const GameSettings = {
  gameSpeed: 1.4,          // default ab 1.4
  soundEnabled: true,
  difficulty: 'normal',    // default normal
  showFPS: false,

  // Load settings from localStorage
  load() {
    try {
      const saved = localStorage.getItem(GameConfig.STORAGE.SETTINGS);
      if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(this, settings);
      }
    } catch (e) {
      console.warn('Failed to load game settings:', e);
    }
  },

  // Save settings to localStorage
  save() {
    try {
      localStorage.setItem(GameConfig.STORAGE.SETTINGS, JSON.stringify({
        gameSpeed: this.gameSpeed,
        soundEnabled: this.soundEnabled,
        difficulty: this.difficulty,
        showFPS: this.showFPS
      }));
    } catch (e) {
      console.warn('Failed to save game settings:', e);
    }
  },

  // 🔹 Reset settings to default values
  reset() {
    this.gameSpeed = 1.4;
    this.soundEnabled = true;
    this.difficulty = 'normal';
    this.showFPS = false;
    this.save();           // save after reset
    this.applyDifficulty();// apply difficulty defaults again
  },

  // Apply difficulty settings
  applyDifficulty() {
    switch (this.difficulty) {
      case 'easy':
        GameConfig.BIRD.GRAVITY = 0.15;
        GameConfig.PIPE.GAP = 1.4;
        GameConfig.PIPE.BASE_SPEED = 1.2;
        break;
      case 'hard':
        GameConfig.BIRD.GRAVITY = 0.25;
        GameConfig.PIPE.GAP = 100;
        GameConfig.PIPE.BASE_SPEED = 1.8;
        break;
      default: // normal
        GameConfig.BIRD.GRAVITY = 0.2;
        GameConfig.PIPE.GAP = 120;
        GameConfig.PIPE.BASE_SPEED = 1.5;
        this.gameSpeed = 1.4; // ensure reset works here also
    }
  }
};

// Initialize settings
GameSettings.load();
GameSettings.applyDifficulty();

