// Game Engine - BirdBird 2.6 - Optimized and Error-Free
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
        console.log('All assets loaded successfully');
      }
    };
    
    const onAssetError = (assetName) => {
      console.warn(`Failed to load ${assetName}, using fallback`);
      loadedCount++;
      if (loadedCount === totalAssets) {
        this.assetsLoaded = true;
      }
    };
    
    // Set up event handlers
    this.assets.bird.onload = onAssetLoad;
    this.assets.bird.onerror = () => onAssetError('bird');
    this.assets.pipe.onload = onAssetLoad;
    this.assets.pipe.onerror = () => onAssetError('pipe');
    this.assets.background.onload = onAssetLoad;
    this.assets.background.onerror = () => onAssetError('background');
    
    // Load assets
    this.assets.bird.src = 'assets/images/bird.png';
    this.assets.pipe.src = 'assets/pipe1.png';
    this.assets.background.src = 'assets/background2.png';
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
    // Enhanced touch handling for all devices
    let touchStartTime = 0;
    let touchProcessed = false;
    let lastTouchTime = 0;
    
    const handleInput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const now = Date.now();
      
      // Prevent rapid fire inputs
      if (now - lastTouchTime < 100) return;
      lastTouchTime = now;
      
      // Prevent double processing
      if (touchProcessed) return;
      touchProcessed = true;
      
      // Reset flag after a short delay
      setTimeout(() => {
        touchProcessed = false;
      }, 150);
      
      if (this.state === 'playing') {
        this.flap();
      } else if (this.state === 'start') {
        this.startGame();
      }
    };
    
    // Mouse events
    this.canvas.addEventListener('click', handleInput, { passive: false });
    
    // Enhanced touch events for all mobile devices
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      touchStartTime = Date.now();
      handleInput(e);
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
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
    
    // Prevent iOS bounce effect and zoom
    document.addEventListener('touchmove', (e) => {
      if (e.target === this.canvas || e.target.closest('.game-container')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
  
  fitCanvas() {
    const container = this.canvas.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = GameConfig.CANVAS_WIDTH / GameConfig.CANVAS_HEIGHT;
    
    // Calculate optimal size based on container and screen
    let width = Math.min(containerRect.width - 32, 400);
    let height = width / aspectRatio;
    
    // Ensure it fits in viewport with proper mobile spacing
    const maxHeight = window.innerHeight * 0.65;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    // Minimum size for very small screens
    if (width < 280) {
      width = 280;
      height = width / aspectRatio;
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
    
    // Optimized frame rate control
    if (deltaTime >= GameConfig.PERFORMANCE.FRAME_TIME) {
      // Cap delta time to prevent large jumps
      const cappedDelta = Math.min(deltaTime, GameConfig.PERFORMANCE.MAX_DELTA_TIME);
      
      this.update(cappedDelta);
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
    const dt = deltaTime / 16.67; // Normalize to 60fps
    const difficulty = GameSettings.getCurrentDifficulty(); // Fixed: Use method instead of direct access
    
    // Update bird physics
    this.bird.velocity += GameConfig.BIRD.GRAVITY * speedMultiplier * dt;
    this.bird.velocity = Math.min(this.bird.velocity, GameConfig.BIRD.MAX_VELOCITY);
    this.bird.y += this.bird.velocity * speedMultiplier * dt;
    
    // Update bird rotation based on velocity
    this.bird.rotation = Math.max(-0.5, Math.min(0.5, this.bird.velocity * 0.05));
    
    // Spawn pipes
    if (this.frame % Math.floor(difficulty.spawnRate / speedMultiplier) === 0) {
      this.spawnPipe();
    }
    
    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= difficulty.speed * speedMultiplier * dt;
      
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
    const difficulty = GameSettings.getCurrentDifficulty(); // Fixed: Use method
    const minY = 50;
    const maxY = GameConfig.CANVAS_HEIGHT - difficulty.pipeGap - 100;
    const gapY = minY + Math.random() * (maxY - minY);
    
    this.pipes.push({
      x: GameConfig.CANVAS_WIDTH,
      topHeight: gapY,
      bottomY: gapY + difficulty.pipeGap,
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
    
    // Pipe collision with improved hitbox
    for (const pipe of this.pipes) {
      if (this.bird.x + GameConfig.BIRD.WIDTH - 6 > pipe.x && 
          this.bird.x + 6 < pipe.x + GameConfig.PIPE.WIDTH) {
        
        if (this.bird.y + 4 < pipe.topHeight || 
            this.bird.y + GameConfig.BIRD.HEIGHT - 4 > pipe.bottomY) {
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
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1,
        color: `hsl(${Math.random() * 60 + 15}, 100%, ${50 + Math.random() * 30}%)`
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
    // Dark theme loading screen
    const gradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', GameConfig.CANVAS_WIDTH/2, GameConfig.CANVAS_HEIGHT/2);
  }
  
  renderBackground() {
    // Enhanced dark theme gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.3, '#764ba2');
    gradient.addColorStop(0.7, '#2d1b69');
    gradient.addColorStop(1, '#1a1a2e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    
    // Animated stars effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 25; i++) {
      const x = (this.frame * 0.1 + i * 50) % (GameConfig.CANVAS_WIDTH + 20) - 10;
      const y = 30 + (i * 37) % (GameConfig.CANVAS_HEIGHT - 100);
      const size = 0.5 + Math.sin(this.frame * 0.02 + i) * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  renderPipes() {
    for (const pipe of this.pipes) {
      // Enhanced dark theme pipe colors
      this.ctx.fillStyle = '#2d4a22';
      this.ctx.strokeStyle = '#1a2e15';
      this.ctx.lineWidth = 2;
      
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, GameConfig.PIPE.WIDTH, pipe.topHeight);
      this.ctx.strokeRect(pipe.x, 0, GameConfig.PIPE.WIDTH, pipe.topHeight);
      
      // Bottom pipe
      this.ctx.fillRect(pipe.x, pipe.bottomY, GameConfig.PIPE.WIDTH, GameConfig.CANVAS_HEIGHT - pipe.bottomY - 50);
      this.ctx.strokeRect(pipe.x, pipe.bottomY, GameConfig.PIPE.WIDTH, GameConfig.CANVAS_HEIGHT - pipe.bottomY - 50);
      
      // Pipe caps with gradient
      const capGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + GameConfig.PIPE.WIDTH, 0);
      capGradient.addColorStop(0, '#3d5a32');
      capGradient.addColorStop(0.5, '#4d6a42');
      capGradient.addColorStop(1, '#3d5a32');
      this.ctx.fillStyle = capGradient;
      
      this.ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, GameConfig.PIPE.WIDTH + 8, 20);
      this.ctx.fillRect(pipe.x - 4, pipe.bottomY, GameConfig.PIPE.WIDTH + 8, 20);
    }
  }
  
  renderBird() {
    this.ctx.save();
    
    // Move to bird position
    this.ctx.translate(this.bird.x + GameConfig.BIRD.WIDTH/2, this.bird.y + GameConfig.BIRD.HEIGHT/2);
    this.ctx.rotate(this.bird.rotation);
    
    if (this.assets.bird.complete && this.assets.bird.naturalWidth) {
      // Draw bird image
      this.ctx.drawImage(
        this.assets.bird,
        -GameConfig.BIRD.WIDTH/2, -GameConfig.BIRD.HEIGHT/2,
        GameConfig.BIRD.WIDTH, GameConfig.BIRD.HEIGHT
      );
    } else {
      // Enhanced fallback bird
      const birdGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, GameConfig.BIRD.WIDTH/2);
      birdGradient.addColorStop(0, '#ffeb3b');
      birdGradient.addColorStop(1, '#ff9800');
      this.ctx.fillStyle = birdGradient;
      this.ctx.strokeStyle = '#e65100';
      this.ctx.lineWidth = 2;
      
      // Bird body
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, GameConfig.BIRD.WIDTH/2, GameConfig.BIRD.HEIGHT/2, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Bird eye
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(5, -3, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Bird beak
      this.ctx.fillStyle = '#ff5722';
      this.ctx.beginPath();
      this.ctx.moveTo(GameConfig.BIRD.WIDTH/2, 0);
      this.ctx.lineTo(GameConfig.BIRD.WIDTH/2 + 8, 2);
      this.ctx.lineTo(GameConfig.BIRD.WIDTH/2, 4);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  renderParticles() {
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 2 + particle.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  
  renderGround() {
    // Enhanced dark theme ground
    const groundHeight = 50;
    const gradient = this.ctx.createLinearGradient(0, GameConfig.CANVAS_HEIGHT - groundHeight, 0, GameConfig.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#2d5016');
    gradient.addColorStop(0.5, '#1a2e0c');
    gradient.addColorStop(1, '#0f1a06');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, GameConfig.CANVAS_HEIGHT - groundHeight, GameConfig.CANVAS_WIDTH, groundHeight);
    
    // Ground texture
    this.ctx.strokeStyle = '#3d6026';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < GameConfig.CANVAS_WIDTH; i += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, GameConfig.CANVAS_HEIGHT - groundHeight);
      this.ctx.lineTo(i, GameConfig.CANVAS_HEIGHT);
      this.ctx.stroke();
    }
  }
  
  renderScore() {
    if (this.state === 'playing') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      
      const scoreText = this.score.toString();
      this.ctx.strokeText(scoreText, GameConfig.CANVAS_WIDTH/2, 60);
      this.ctx.fillText(scoreText, GameConfig.CANVAS_WIDTH/2, 60);
    }
  }
  
  renderFPS() {
    this.ctx.fillStyle = '#64ffda';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
  }
}

