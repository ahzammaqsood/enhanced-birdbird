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
    
        // Offscreen background cache for smoother mobile rendering
    this._offscreenBg = document.createElement('canvas');
    this._offscreenBgCtx = this._offscreenBg.getContext('2d');
    this._bgNeedsUpdate = true;
    this._bgOffset = 0;

// Game objects
    this.bird = {
      y: GameConfig.BIRD.START_Y,
      velocity: 0
    };
    
    this.pipes = [];
    
    // Asset loading
    this.assets = {
      bird: new Image(),
      pipe: new Image(),
      background: new Image()
    };
    
    this.loadAssets();
    this.setupCanvas();
  }
  
  loadAssets() {
    this.assets.bird.src = 'assets/images/bird.png';
    this.assets.pipe.src = 'assets/images/pipe.png';
    this.assets.background.src = 'assets/images/background.png';
  }
  
  setupCanvas() {
    // Set internal resolution
    this.canvas.width = GameConfig.CANVAS_WIDTH;
    this.canvas.height = GameConfig.CANVAS_HEIGHT;
    
    // Make canvas responsive
    this.fitCanvas();
    window.addEventListener('resize', () => this.fitCanvas());
  }
  
  
fitCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = GameConfig.CANVAS_WIDTH / GameConfig.CANVAS_HEIGHT;

    // Calculate CSS display size
    let cssWidth = Math.max(100, containerRect.width - 24); // account for padding, min width
    let cssHeight = cssWidth / aspectRatio;

    // Limit height so overlay doesn't overflow on small screens
    if (cssHeight > window.innerHeight * 0.7) {
      cssHeight = window.innerHeight * 0.7;
      cssWidth = cssHeight * aspectRatio;
    }

    // Device Pixel Ratio for crisp rendering, cap to avoid excessive work on very high-DPI phones
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // Scale factor that maps game logical units (GameConfig.CANVAS_WIDTH) -> physical pixels
    const scale = (cssWidth * DPR) / GameConfig.CANVAS_WIDTH;

    // Set internal drawing buffer (physical pixels)
    this.canvas.width = Math.round(GameConfig.CANVAS_WIDTH * scale);
    this.canvas.height = Math.round(GameConfig.CANVAS_HEIGHT * scale);

    // Set CSS size for layout (logical pixels)
    this.canvas.style.width = Math.round(cssWidth) + 'px';
    this.canvas.style.height = Math.round(cssHeight) + 'px';

    // Apply transform so the rest of the code can continue drawing in logical game units (GameConfig.*)
    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // Mark background cache to be rebuilt at new size
    this._bgNeedsUpdate = true;
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
  
  reset() {
    this.bird.y = GameConfig.BIRD.START_Y;
    this.bird.velocity = 0;
    this.pipes = [];
    this.frame = 0;
    this.score = 0;
    this.state = 'playing';
    this.start();
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
    
    // Update bird physics
    this.bird.velocity += GameConfig.BIRD.GRAVITY * speedMultiplier;
    this.bird.y += this.bird.velocity * speedMultiplier;
    
    // Spawn pipes
    if (this.frame % GameConfig.PIPE.SPAWN_INTERVAL === 0) {
      this.spawnPipe();
    }
    
    // Update pipes
    const currentSpeed = this.getCurrentPipeSpeed() * speedMultiplier;
    this.pipes.forEach(pipe => {
      pipe.x -= currentSpeed;
    });
    
    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x + GameConfig.PIPE.WIDTH > 0);
    
    // Check collisions
    this.checkCollisions();
    
    // Check scoring
    this.checkScoring(currentSpeed);
  }
  
  getCurrentPipeSpeed() {
    const speedIncrease = Math.floor(this.score / GameConfig.DIFFICULTY.SPEED_INCREASE_PER_SCORE);
    const multiplier = Math.min(1 + speedIncrease * 0.1, GameConfig.DIFFICULTY.MAX_SPEED_MULTIPLIER);
    return GameConfig.PIPE.BASE_SPEED * multiplier;
  }
  
  spawnPipe() {
    const minTop = GameConfig.PIPE.MIN_TOP;
    const maxTop = this.canvas.height - GameConfig.PIPE.GAP - GameConfig.PIPE.MAX_TOP_OFFSET;
    const y = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    
    this.pipes.push({
      x: this.canvas.width,
      y: y,
      scored: false
    });
  }
  
  checkCollisions() {
    const birdLeft = GameConfig.BIRD.X;
    const birdRight = GameConfig.BIRD.X + GameConfig.BIRD.WIDTH;
    const birdTop = this.bird.y;
    const birdBottom = this.bird.y + GameConfig.BIRD.HEIGHT;
    
    // Ground and ceiling collision
    if (birdTop <= 0 || birdBottom >= this.canvas.height) {
      this.gameOver();
      return;
    }
    
    // Pipe collision
    for (const pipe of this.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + GameConfig.PIPE.WIDTH;
      
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.y || birdBottom > pipe.y + GameConfig.PIPE.GAP) {
          this.gameOver();
          return;
        }
      }
    }
  }
  
  checkScoring(currentSpeed) {
    for (const pipe of this.pipes) {
      if (!pipe.scored && pipe.x + GameConfig.PIPE.WIDTH < GameConfig.BIRD.X) {
        pipe.scored = true;
        this.score++;
        
        // Trigger score event
        if (window.gameEvents) {
          window.gameEvents.onScore(this.score);
        }
      }
    }
  }
  
  flap() {
    if (this.state === 'playing') {
      this.bird.velocity = GameConfig.BIRD.JUMP_FORCE;
      
      // Trigger flap event
      if (window.gameEvents) {
        window.gameEvents.onFlap();
      }
    }
  }
  
  gameOver() {
    this.state = 'gameOver';
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    // Trigger game over event
    if (window.gameEvents) {
      window.gameEvents.onGameOver(this.score, this.highScore);
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.drawBackground();
    
    // Draw pipes
    this.drawPipes();
    
    // Draw bird
    this.drawBird();
    
    // Draw score
    this.drawScore();
    
    // Draw FPS if enabled
    if (GameSettings.showFPS) {
      this.drawFPS();
    }
  }
  
  
drawBackground() {
    // Use an offscreen canvas to pre-render the tiled background once per resize
    if (this.assets.background && this.assets.background.complete && this.assets.background.naturalWidth) {
      const bg = this.assets.background;

      // If offscreen buffer doesn't match the current canvas size, rebuild it
      if (this._offscreenBg.width !== this.canvas.width || this._offscreenBg.height !== this.canvas.height || this._bgNeedsUpdate) {
        this._offscreenBg.width = this.canvas.width;
        this._offscreenBg.height = this.canvas.height;
        const bctx = this._offscreenBgCtx;
        bctx.clearRect(0, 0, this._offscreenBg.width, this._offscreenBg.height);

        // Maintain aspect ratio of the source image when drawing
        const scaleY = this._offscreenBg.height / (bg.naturalHeight || bg.height);
        const drawW = Math.round((bg.naturalWidth || bg.width) * scaleY);
        // tile horizontally into offscreen buffer
        for (let x = 0; x < this._offscreenBg.width + drawW; x += drawW) {
          bctx.drawImage(bg, x, 0, drawW, this._offscreenBg.height);
        }
        this._bgNeedsUpdate = false;
      }

      // Parallax: advance offset smoothly (frame-independent)
      this._bgOffset = (this._bgOffset + 0.5) % this._offscreenBg.width;

      // Draw the offscreen background with offset (two draws to cover wrap)
      const ox = Math.round(this._bgOffset);
      const w = this._offscreenBg.width;
      this.ctx.drawImage(this._offscreenBg, -ox, 0, w, this._offscreenBg.height);
      if (ox > 0) {
        this.ctx.drawImage(this._offscreenBg, w - ox, 0, w, this._offscreenBg.height);
      }
    } else {
      // Fallback gradient background (cached per height)
      if (!this._bgGradient || this._bgGradientHeight !== this.canvas.height) {
        this._bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this._bgGradient.addColorStop(0, '#87CEEB');
        this._bgGradient.addColorStop(1, '#98D8E8');
        this._bgGradientHeight = this.canvas.height;
      }
      this.ctx.fillStyle = this._bgGradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

    } else {
      // Fallback gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98D8E8');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  drawBird() {
    this.ctx.save();
    
    // Rotate bird based on velocity
    const rotation = Math.max(-0.5, Math.min(0.5, this.bird.velocity * 0.1));
    this.ctx.translate(GameConfig.BIRD.X + GameConfig.BIRD.WIDTH / 2, this.bird.y + GameConfig.BIRD.HEIGHT / 2);
    this.ctx.rotate(rotation);
    
    if (this.assets.bird.complete && this.assets.bird.naturalWidth) {
      this.ctx.drawImage(
        this.assets.bird,
        -GameConfig.BIRD.WIDTH / 2,
        -GameConfig.BIRD.HEIGHT / 2,
        GameConfig.BIRD.WIDTH,
        GameConfig.BIRD.HEIGHT
      );
    } else {
      // Fallback rectangle
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillRect(
        -GameConfig.BIRD.WIDTH / 2,
        -GameConfig.BIRD.HEIGHT / 2,
        GameConfig.BIRD.WIDTH,
        GameConfig.BIRD.HEIGHT
      );
    }
    
    this.ctx.restore();
  }
  
  drawPipes() {
    this.ctx.fillStyle = '#228B22';
    
    this.pipes.forEach(pipe => {
      if (this.assets.pipe.complete && this.assets.pipe.naturalWidth) {
        // Top pipe (flipped)
        this.ctx.save();
        this.ctx.translate(pipe.x + GameConfig.PIPE.WIDTH / 2, pipe.y);
        this.ctx.scale(1, -1);
        this.ctx.drawImage(this.assets.pipe, -GameConfig.PIPE.WIDTH / 2, 0, GameConfig.PIPE.WIDTH, pipe.y);
        this.ctx.restore();
        
        // Bottom pipe
        this.ctx.drawImage(
          this.assets.pipe,
          pipe.x,
          pipe.y + GameConfig.PIPE.GAP,
          GameConfig.PIPE.WIDTH,
          this.canvas.height - (pipe.y + GameConfig.PIPE.GAP)
        );
      } else {
        // Fallback rectangles
        this.ctx.fillRect(pipe.x, 0, GameConfig.PIPE.WIDTH, pipe.y);
        this.ctx.fillRect(
          pipe.x,
          pipe.y + GameConfig.PIPE.GAP,
          GameConfig.PIPE.WIDTH,
          this.canvas.height - (pipe.y + GameConfig.PIPE.GAP)
        );
      }
    });
  }
  
  drawScore() {
    this.ctx.save();
    this.ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#000';
    this.ctx.fillStyle = '#FFF';
    
    const x = this.canvas.width / 2;
    const y = 50;
    
    this.ctx.strokeText(String(this.score), x, y);
    this.ctx.fillText(String(this.score), x, y);
    this.ctx.restore();
  }
  
  drawFPS() {
    this.ctx.save();
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = '#FFF';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    this.ctx.restore();
  }
}

