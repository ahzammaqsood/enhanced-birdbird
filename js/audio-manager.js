// Audio Manager - Handles all game audio
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
      hit: 'assets/audio/hit.ogg',
      score: 'assets/audio/score.ogg',
      die: 'assets/audio/die.ogg'
    };
    
    Object.entries(soundFiles).forEach(([name, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds[name] = audio;
    });
  }
  
  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) {
      return;
    }
    
    try {
      const sound = this.sounds[soundName];
      sound.currentTime = 0; // Reset to beginning
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented, ignore the error
          console.debug('Audio play prevented:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
    GameSettings.soundEnabled = enabled;
    GameSettings.save();
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }
  
  // Preload all sounds (call after user interaction)
  preloadAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }
}

