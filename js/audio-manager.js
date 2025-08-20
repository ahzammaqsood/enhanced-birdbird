// Audio Manager - BirdBird 2.6 - Enhanced
class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = GameSettings.soundEnabled;
    this.volume = GameConfig.AUDIO.VOLUME;
    this.loadSounds();
  }
  
  loadSounds() {
    const soundFiles = {
      flap: 'assets/audio/flap.ogg',
      score: 'assets/audio/score.ogg',
      hit: 'assets/audio/hit.ogg',
      die: 'assets/audio/die.ogg'
    };
    
    for (const [name, src] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(src);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${name}`);
        });
        
        // Handle successful loading
        audio.addEventListener('canplaythrough', () => {
          console.log(`Sound loaded: ${name}`);
        });
        
        this.sounds[name] = audio;
      } catch (e) {
        console.warn(`Failed to create audio for: ${name}`, e);
      }
    }
  }
  
  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) {
      return;
    }
    
    try {
      const sound = this.sounds[soundName];
      sound.currentTime = 0; // Reset to beginning
      sound.volume = this.volume;
      
      // Play with promise handling for better browser compatibility
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Don't log errors for user interaction requirements
          if (error.name !== 'NotAllowedError') {
            console.warn(`Failed to play sound ${soundName}:`, error);
          }
        });
      }
    } catch (e) {
      console.warn(`Error playing sound ${soundName}:`, e);
    }
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        sound.volume = this.volume;
      }
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
    GameSettings.soundEnabled = enabled;
    GameSettings.save();
  }
  
  isEnabled() {
    return this.enabled;
  }
  
  // Initialize audio context on first user interaction
  initializeAudioContext() {
    if (this.audioContextInitialized) return;
    
    try {
      // Play a silent sound to initialize audio context
      for (const sound of Object.values(this.sounds)) {
        if (sound) {
          sound.volume = 0;
          const playPromise = sound.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              sound.pause();
              sound.currentTime = 0;
              sound.volume = this.volume;
            }).catch(() => {
              // Ignore errors during initialization
            });
          }
          break;
        }
      }
      this.audioContextInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize audio context:', e);
    }
  }
}

