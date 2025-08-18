// Enhanced UI Manager for Modals and Navigation
class EnhancedUIManager {
  constructor() {
    this.activeModal = null;
    this.mobileNavOpen = false;
    this.init();
  }
  
  init() {
    this.createHamburgerMenu();
    this.createMobileNavigation();
    this.enhanceExistingModals();
    this.setupEventListeners();
  }
  
  createHamburgerMenu() {
    // Check if hamburger menu already exists
    if (document.querySelector('.hamburger-menu')) return;
    
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;
    
    document.body.appendChild(hamburger);
  }
  
  createMobileNavigation() {
    // Check if mobile nav already exists
    if (document.querySelector('.mobile-nav-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.innerHTML = `
      <div class="mobile-nav-panel">
        <div class="mobile-nav-header">
          <h3 class="mobile-nav-title">🐦 BirdBird</h3>
          <button class="mobile-nav-close" aria-label="Close navigation">×</button>
        </div>
        <nav class="mobile-nav-menu">
          <a href="#home" class="mobile-nav-item active">Home</a>
          <a href="#leaderboard" class="mobile-nav-item">Leaderboard</a>
          <a href="#blog" class="mobile-nav-item">Blog</a>
          <a href="#about" class="mobile-nav-item">About</a>
          <a href="#privacy" class="mobile-nav-item">Privacy</a>
        </nav>
        <div class="mobile-theme-toggle">
          <span class="mobile-theme-label">Dark Mode</span>
          <div class="mobile-theme-switch" id="mobile-theme-switch"></div>
        </div>
        <div class="mobile-nav-footer">
          <p class="mobile-nav-footer-text">Powered by Ahzam Maqsood</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  enhanceExistingModals() {
    // Find existing game over modal and enhance it
    const gameOverModal = document.querySelector('#overlayGameOver, .game-over-modal');
    if (gameOverModal) {
      this.enhanceGameOverModal(gameOverModal);
    }
    
    // Find settings modal and enhance it
    const settingsModal = document.querySelector('#overlaySettings, .settings-modal');
    if (settingsModal) {
      this.enhanceSettingsModal(settingsModal);
    }
  }
  
  enhanceGameOverModal(modal) {
    modal.classList.add('modal-overlay', 'game-over-modal');
    
    // Wrap content in modal container if not already wrapped
    if (!modal.querySelector('.modal-container')) {
      const content = modal.innerHTML;
      modal.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Game Over</h2>
            <button class="modal-close" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      `;
    }
  }
  
  enhanceSettingsModal(modal) {
    modal.classList.add('modal-overlay', 'settings-modal');
    
    // Wrap content in modal container if not already wrapped
    if (!modal.querySelector('.modal-container')) {
      const content = modal.innerHTML;
      modal.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Settings</h2>
            <button class="modal-close" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      `;
    }
  }
  
  setupEventListeners() {
    // Hamburger menu toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.hamburger-menu')) {
        this.toggleMobileNav();
      }
      
      // Mobile nav close button
      if (e.target.closest('.mobile-nav-close')) {
        this.closeMobileNav();
      }
      
      // Mobile nav overlay click (close on backdrop)
      if (e.target.classList.contains('mobile-nav-overlay')) {
        this.closeMobileNav();
      }
      
      // Modal close buttons
      if (e.target.closest('.modal-close')) {
        this.closeModal();
      }
      
      // Modal overlay click (close on backdrop)
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
      
      // Mobile theme toggle
      if (e.target.closest('#mobile-theme-switch')) {
        this.toggleMobileTheme();
      }
      
      // Mobile nav links
      if (e.target.closest('.mobile-nav-item')) {
        this.handleMobileNavClick(e);
      }
    });
    
    // Escape key to close modals and mobile nav
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.mobileNavOpen) {
          this.closeMobileNav();
        } else if (this.activeModal) {
          this.closeModal();
        }
      }
    });
    
    // Update mobile theme switch based on current theme
    this.updateMobileThemeSwitch();
  }
  
  toggleMobileNav() {
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }
  
  openMobileNav() {
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    hamburger.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('mobile-nav-open');
    this.mobileNavOpen = true;
    
    // Animate menu items
    const items = overlay.querySelectorAll('.mobile-nav-item');
    items.forEach((item, index) => {
      item.style.animationDelay = `${0.1 + index * 0.05}s`;
    });
  }
  
  closeMobileNav() {
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('mobile-nav-open');
    this.mobileNavOpen = false;
  }
  
  handleMobileNavClick(e) {
    e.preventDefault();
    const link = e.target.closest('.mobile-nav-item');
    const href = link.getAttribute('href');
    
    // Update active state
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    link.classList.add('active');
    
    // Close mobile nav
    this.closeMobileNav();
    
    // Navigate to section
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  toggleMobileTheme() {
    const themeSwitch = document.querySelector('#mobile-theme-switch');
    const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'light';
    
    if (window.themeManager) {
      window.themeManager.toggleTheme();
      this.updateMobileThemeSwitch();
    }
  }
  
  updateMobileThemeSwitch() {
    const themeSwitch = document.querySelector('#mobile-theme-switch');
    if (!themeSwitch) return;
    
    const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'light';
    
    if (currentTheme === 'dark') {
      themeSwitch.classList.add('active');
    } else {
      themeSwitch.classList.remove('active');
    }
  }
  
  // Enhanced Modal Methods
  showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Close any existing modal first
    this.closeModal();
    
    modal.classList.add('active');
    modal.classList.add('modal-slide-in');
    this.activeModal = modal;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Auto close if specified
    if (options.autoClose) {
      setTimeout(() => this.closeModal(), options.autoClose);
    }
    
    // Focus management
    const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  
  closeModal() {
    if (!this.activeModal) return;
    
    this.activeModal.classList.add('modal-slide-out');
    this.activeModal.classList.remove('modal-slide-in');
    
    setTimeout(() => {
      this.activeModal.classList.remove('active', 'modal-slide-out');
      this.activeModal = null;
      document.body.style.overflow = '';
    }, 300);
  }
  
  // Enhanced Game Over Modal
  showGameOverModal(score, highScore, isNewHighScore = false) {
    const modal = document.querySelector('.game-over-modal, #overlayGameOver');
    if (!modal) return;
    
    // Update modal content
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="score-display">
          <div class="score-item">
            <span>Your Score:</span>
            <span class="score-value">${score}</span>
          </div>
          <div class="score-item">
            <span>High Score:</span>
            <span class="score-value">
              ${highScore}
              ${isNewHighScore ? '<span class="high-score-badge">NEW!</span>' : ''}
            </span>
          </div>
        </div>
        
        <div class="modal-actions">
          ${isNewHighScore && score > 0 ? `
            <div class="leaderboard-form">
              <div class="form-group">
                <label class="form-label" for="playerName">Enter your name:</label>
                <input type="text" id="playerName" class="form-input" placeholder="Your name" maxlength="20">
              </div>
            </div>
            <button class="modal-btn success" onclick="saveToLeaderboard()">
              🏆 Save to Leaderboard
            </button>
          ` : ''}
          
          <button class="modal-btn primary" onclick="restartGame()">
            🔄 Play Again
          </button>
          
          <button class="modal-btn secondary" onclick="shareScore(${score})">
            📱 Share Score
          </button>
        </div>
      `;
    }
    
    this.showModal(modal.id);
  }
  
  // Enhanced notification system
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
      </div>
    `;
    
    // Styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1002;
      background: var(--theme-glass-bg);
      border: 1px solid var(--theme-glass-border);
      border-radius: 12px;
      padding: 1rem;
      backdrop-filter: blur(20px);
      color: var(--theme-text-primary);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 300px;
      box-shadow: 0 10px 30px var(--theme-shadow);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.closeNotification(notification);
    });
    
    // Auto remove
    setTimeout(() => {
      this.closeNotification(notification);
    }, duration);
  }
  
  closeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  getNotificationIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || icons.info;
  }
}

// Initialize enhanced UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedUI = new EnhancedUIManager();
  
  // Listen for theme changes to update mobile switch
  if (window.themeManager) {
    const originalApplyTheme = window.themeManager.applyTheme;
    window.themeManager.applyTheme = function(theme) {
      originalApplyTheme.call(this, theme);
      if (window.enhancedUI) {
        window.enhancedUI.updateMobileThemeSwitch();
      }
    };
  }
});

// Global functions for game integration
window.showGameOverModal = function(score, highScore, isNewHighScore) {
  if (window.enhancedUI) {
    window.enhancedUI.showGameOverModal(score, highScore, isNewHighScore);
  }
};

window.showNotification = function(message, type, duration) {
  if (window.enhancedUI) {
    window.enhancedUI.showNotification(message, type, duration);
  }
};

window.restartGame = function() {
  if (window.enhancedUI) {
    window.enhancedUI.closeModal();
  }
  
  // Restart game logic
  if (window.gameEngine) {
    window.gameEngine.startGame();
  }
  
  // Show start overlay
  const startOverlay = document.getElementById('overlayStart');
  if (startOverlay) {
    startOverlay.classList.remove('hidden');
  }
};

window.shareScore = function(score) {
  const text = `I just scored ${score} points in BirdBird! Can you beat my score? 🐦🎮`;
  const url = window.location.href;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
  
  if (window.enhancedUI) {
    window.enhancedUI.showNotification('Score shared! 📱', 'success');
  }
};

window.saveToLeaderboard = function() {
  const nameInput = document.getElementById('playerName');
  const name = nameInput ? nameInput.value.trim() : '';
  
  if (!name) {
    if (window.enhancedUI) {
      window.enhancedUI.showNotification('Please enter your name!', 'warning');
    }
    return;
  }
  
  // Save to leaderboard logic here
  if (window.leaderboard && window.gameEngine) {
    window.leaderboard.addScore(name, window.gameEngine.getScore());
  }
  
  if (window.enhancedUI) {
    window.enhancedUI.closeModal();
    window.enhancedUI.showNotification('Score saved to leaderboard! 🏆', 'success');
  }
  
  // Restart game
  window.restartGame();
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedUIManager };
}

