// Game Engine - Core game logic and rendering
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'start'; // start | playing | paused | gameOver
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.frame = 0;
    this.animationId = 0;
    this.lastFrameTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    
    // Game objects
    this.bird = {
      x: GameConfig.BIRD.X,
      y: GameConfig.BIRD.START_Y,
      velocity: 0,
      rotation: 0
    };
    
    this.pipes = [];
    this.particles = [];
    
    // Asset loading
    this.assets = {
      bird: new Image(),
      pipe: new Image(),
      background: new Image()
    };
    
    this.assetsLoaded = false;
    this.loadAssets();
    this.setupCanvas();
    this.setupInputHandlers();
  }
  
  loadAssets() {
    let loadedCount = 0;
    const totalAssets = Object.keys(this.assets).length;
    
    const onAssetLoad = () => {
      loadedCount++;
      if (loadedCount === totalAssets) {
        this.assetsLoaded = true;
        console.log('All assets loaded');
      }
    };
    
    const onAssetError = (assetName) => {
      console.warn(`Failed to load ${assetName}, using fallback`);
      loadedCount++;
      if (loadedCount === totalAssets) {
        this.assetsLoaded = true;
      }
    };
    
    this.assets.bird.onload = onAssetLoad;
    this.assets.bird.onerror = () => onAssetError('bird');
    this.assets.pipe.onload = onAssetLoad;
    this.assets.pipe.onerror = () => onAssetError('pipe');
    this.assets.background.onload = onAssetLoad;
    this.assets.background.onerror = () => onAssetError('background');
    
    // Use the available custom images
    this.assets.bird.src = 'assets/images/bird.png';
    this.assets.pipe.src = 'assets/pipe1.png'; // Use the custom pipe from assets root
    this.assets.background.src = 'assets/background2.png'; // Use the custom background from assets root
  }
  
  setupCanvas() {
    // Set internal resolution
    this.canvas.width = GameConfig.CANVAS_WIDTH;
    this.canvas.height = GameConfig.CANVAS_HEIGHT;
    
    // Optimize canvas for performance
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    // Make canvas responsive
    this.fitCanvas();
    window.addEventListener('resize', () => this.fitCanvas());
  }
  
  setupInputHandlers() {
    // Mouse/Touch events
    const handleInput = (e) => {
      e.preventDefault();
      if (this.state === 'playing') {
        this.flap();
      } else if (this.state === 'start') {
        this.startGame();
      }
    };
    
    // Mouse events
    this.canvas.addEventListener('click', handleInput);
    
    // Touch events with proper handling for iOS
    this.canvas.addEventListener('touchstart', handleInput, { passive: false });
    this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.state === 'playing') {
          this.flap();
        } else if (this.state === 'start') {
          this.startGame();
        }
      }
    });
  }
  
  fitCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = GameConfig.CANVAS_WIDTH / GameConfig.CANVAS_HEIGHT;
    
    let width = Math.min(containerRect.width - 24, 400); // Max width 400px
    let height = width / aspectRatio;
    
    // Ensure it fits in viewport
    const maxHeight = window.innerHeight * 0.7;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }
  
  loadHighScore() {
    try {
      return Number(localStorage.getItem(GameConfig.STORAGE.HIGH_SCORE) || 0);
    } catch (e) {
      return 0;
    }
  }
  
  saveHighScore() {
    try {
      localStorage.setItem(GameConfig.STORAGE.HIGH_SCORE, String(this.highScore));
    } catch (e) {
      console.warn('Failed to save high score:', e);
    }
  }
  
  startGame() {
    this.reset();
    this.state = 'playing';
    this.start();
    
    // Hide start overlay
    const startOverlay = document.getElementById('overlayStart');
    if (startOverlay) {
      startOverlay.classList.add('hidden');
    }
    
    // Trigger game start event
    if (window.gameEvents && window.gameEvents.onGameStart) {
      window.gameEvents.onGameStart();
    }
  }
  
  reset() {
    this.bird.x = GameConfig.BIRD.X;
    this.bird.y = GameConfig.BIRD.START_Y;
    this.bird.velocity = 0;
    this.bird.rotation = 0;
    this.pipes = [];
    this.particles = [];
    this.frame = 0;
    this.score = 0;
    this.shakeIntensity = 0;
  }
  
  start() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }
  
  pause() {
    this.state = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }
  
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }
  
  gameLoop(currentTime = performance.now()) {
    if (this.state !== 'playing') return;
    
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Cap frame rate
    if (deltaTime >= GameConfig.PERFORMANCE.FRAME_TIME) {
      this.update(deltaTime);
      this.render();
      
      this.lastFrameTime = currentTime;
      this.frame++;
      
      // Calculate FPS
      this.frameCount++;
      if (currentTime - this.lastFpsUpdate >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdate = currentTime;
      }
    }
    
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  update(deltaTime) {
    const speedMultiplier = GameSettings.gameSpeed;
    const dt = Math.min(deltaTime / 16.67, 2); // Cap delta time
    
    // Update bird physics
    this.bird.velocity += GameConfig.BIRD.GRAVITY * speedMultiplier * dt;
    this.bird.y += this.bird.velocity * speedMultiplier * dt;
    
    // Update bird rotation based on velocity
    this.bird.rotation = Math.max(-0.5, Math.min(0.5, this.bird.velocity * 0.05));
    
    // Spawn pipes
    if (this.frame % Math.floor(120 / speedMultiplier) === 0) {
      this.spawnPipe();
    }
    
    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= GameConfig.PIPE.BASE_SPEED * speedMultiplier * dt;
      
      // Check for scoring
      if (!pipe.scored && pipe.x + GameConfig.PIPE.WIDTH < this.bird.x) {
        pipe.scored = true;
        this.score++;
        
        // Update high score
        if (this.score > this.highScore) {
          this.highScore = this.score;
          this.saveHighScore();
        }
        
        // Trigger score event
        if (window.gameEvents && window.gameEvents.onScore) {
          window.gameEvents.onScore(this.score);
        }
      }
      
      // Remove off-screen pipes
      if (pipe.x + GameConfig.PIPE.WIDTH < 0) {
        this.pipes.splice(i, 1);
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 0.5 * dt; // gravity
      particle.life -= dt * 0.02;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update screen shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= this.shakeDecay;
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
      }
    }
    
    // Check collisions
    this.checkCollisions();
  }
  
  spawnPipe() {
    const minY = 50;
    const maxY = GameConfig.CANVAS_HEIGHT - GameConfig.PIPE.GAP - 100;
    const gapY = minY + Math.random() * (maxY - minY);
    
    this.pipes.push({
      x: GameConfig.CANVAS_WIDTH,
      topHeight: gapY,
      bottomY: gapY + GameConfig.PIPE.GAP,
      scored: false
    });
  }
  
  checkCollisions() {
    // Ground collision
    if (this.bird.y + GameConfig.BIRD.HEIGHT >= GameConfig.CANVAS_HEIGHT - 50) {
      this.gameOver();
      return;
    }
    
    // Ceiling collision
    if (this.bird.y <= 0) {
      this.gameOver();
      return;
    }
    
    // Pipe collision
    for (const pipe of this.pipes) {
      if (this.bird.x + GameConfig.BIRD.WIDTH > pipe.x && 
          this.bird.x < pipe.x + GameConfig.PIPE.WIDTH) {
        
        if (this.bird.y < pipe.topHeight || 
            this.bird.y + GameConfig.BIRD.HEIGHT > pipe.bottomY) {
          this.gameOver();
          return;
        }
      }
    }
  }
  
  flap() {
    this.bird.velocity = GameConfig.BIRD.JUMP_FORCE;
    
    // Trigger flap event
    if (window.gameEvents && window.gameEvents.onFlap) {
      window.gameEvents.onFlap();
    }
  }
  
  gameOver() {
    this.state = 'gameOver';
    
    // Add screen shake effect
    this.shakeIntensity = 10;
    
    // Create explosion particles
    this.createExplosion(this.bird.x + GameConfig.BIRD.WIDTH/2, this.bird.y + GameConfig.BIRD.HEIGHT/2);
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    
    // Trigger game over event
    if (window.gameEvents && window.gameEvents.onGameOver) {
      window.gameEvents.onGameOver(this.score, this.highScore);
    }
  }
  
  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
      });
    }
  }
  
  render() {
    if (!this.assetsLoaded) {
      this.renderLoading();
      return;
    }
    
    // Apply screen shake
    this.ctx.save();
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(shakeX, shakeY);
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    
    // Draw background
    this.renderBackground();
    
    // Draw pipes
    this.renderPipes();
    
    // Draw bird
    this.renderBird();
    
    // Draw particles
    this.renderParticles();
    
    // Draw ground
    this.renderGround();
    
    // Draw score
    this.renderScore();
    
    // Draw FPS if enabled
    if (GameSettings.showFPS) {
      this.renderFPS();
    }
    
    this.ctx.restore();
  }
  
  renderLoading() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#000';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', GameConfig.CANVAS_WIDTH/2, GameConfig.CANVAS_HEIGHT/2);
  }
  
  renderBackground() {
    // Try to use custom background image first
    if (this.assets.background.complete && this.assets.background.naturalWidth) {
      // Draw the custom background image
      this.ctx.drawImage(
        this.assets.background,
        0, 0,
        GameConfig.CANVAS_WIDTH,
        GameConfig.CANVAS_HEIGHT
      );
    } else {
      // Fallback to gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98D8E8');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
      
      // Clouds (simple)
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 3; i++) {
        const x = (this.frame * 0.2 + i * 120) % (GameConfig.CANVAS_WIDTH + 60) - 30;
        const y = 50 + i * 30;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
  
  renderPipes() {
    for (const pipe of this.pipes) {
      if (this.assets.pipe.complete && this.assets.pipe.naturalWidth) {
        // Use custom pipe image
        const pipeWidth = GameConfig.PIPE.WIDTH;
        const pipeHeight = this.assets.pipe.height;
        
        // Top pipe (flipped)
        this.ctx.save();
        this.ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight);
        this.ctx.scale(1, -1);
        this.ctx.drawImage(
          this.assets.pipe,
          -pipeWidth / 2, 0,
          pipeWidth, pipe.topHeight
        );
        this.ctx.restore();
        
        // Bottom pipe
        this.ctx.drawImage(
          this.assets.pipe,
          pipe.x, pipe.bottomY,
          pipeWidth, GameConfig.CANVAS_HEIGHT - pipe.bottomY - 50
        );
      } else {
        // Fallback to colored rectangles
        this.ctx.fillStyle = '#228B22';
        
        // Top pipe
        this.ctx.fillRect(pipe.x, 0, GameConfig.PIPE.WIDTH, pipe.topHeight);
        
        // Bottom pipe
        this.ctx.fillRect(pipe.x, pipe.bottomY, GameConfig.PIPE.WIDTH, 
                         GameConfig.CANVAS_HEIGHT - pipe.bottomY - 50);
        
        // Pipe caps
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, GameConfig.PIPE.WIDTH + 10, 20);
        this.ctx.fillRect(pipe.x - 5, pipe.bottomY, GameConfig.PIPE.WIDTH + 10, 20);
        this.ctx.fillStyle = '#228B22';
      }
    }
  }
  
  renderBird() {
    this.ctx.save();
    
    // Move to bird center for rotation
    this.ctx.translate(this.bird.x + GameConfig.BIRD.WIDTH/2, this.bird.y + GameConfig.BIRD.HEIGHT/2);
    this.ctx.rotate(this.bird.rotation);
    
    if (this.assets.bird.complete && this.assets.bird.naturalWidth) {
      // Use custom bird image
      this.ctx.drawImage(
        this.assets.bird,
        -GameConfig.BIRD.WIDTH/2,
        -GameConfig.BIRD.HEIGHT/2,
        GameConfig.BIRD.WIDTH,
        GameConfig.BIRD.HEIGHT
      );
    } else {
      // Fallback to colored rectangle
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillRect(-GameConfig.BIRD.WIDTH/2, -GameConfig.BIRD.HEIGHT/2, 
                       GameConfig.BIRD.WIDTH, GameConfig.BIRD.HEIGHT);
      
      // Bird eye
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(-GameConfig.BIRD.WIDTH/2 + 8, -GameConfig.BIRD.HEIGHT/2 + 2, 4, 4);
      
      // Bird beak
      this.ctx.fillStyle = '#FF8C00';
      this.ctx.fillRect(GameConfig.BIRD.WIDTH/2 - 2, -2, 6, 4);
    }
    
    this.ctx.restore();
  }
  
  renderParticles() {
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      this.ctx.restore();
    }
  }
  
  renderGround() {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, GameConfig.CANVAS_HEIGHT - 50, 
                     GameConfig.CANVAS_WIDTH, 50);
    
    // Grass
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, GameConfig.CANVAS_HEIGHT - 50, 
                     GameConfig.CANVAS_WIDTH, 5);
  }
  
  renderScore() {
    this.ctx.save();
    this.ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#000';
    this.ctx.fillStyle = '#FFF';
    
    const x = GameConfig.CANVAS_WIDTH / 2;
    const y = 50;
    
    this.ctx.strokeText(String(this.score), x, y);
    this.ctx.fillText(String(this.score), x, y);
    this.ctx.restore();
  }
  
  renderFPS() {
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
  }
  
  // Public API
  getState() {
    return this.state;
  }
  
  getScore() {
    return this.score;
  }
  
  getHighScore() {
    return this.highScore;
  }
}

