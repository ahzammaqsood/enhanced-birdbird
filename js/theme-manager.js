// Theme Manager - Dark/Light Mode Functionality
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }
  
  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeToggle();
    this.setupEventListeners();
  }
  
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  getStoredTheme() {
    try {
      return localStorage.getItem('flappybird-theme');
    } catch (e) {
      return null;
    }
  }
  
  storeTheme(theme) {
    try {
      localStorage.setItem('flappybird-theme', theme);
    } catch (e) {
      console.warn('Failed to store theme preference:', e);
    }
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.storeTheme(theme);
    this.updateThemeToggle();
    this.updateGameTheme();
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    
    // Add a nice transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }
  
  createThemeToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.id = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle theme');
    toggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
    
    // Insert after header or at the beginning of body
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(toggle);
    } else {
      document.body.insertBefore(toggle, document.body.firstChild);
    }
  }
  
  updateThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
      toggle.setAttribute('aria-label', `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme`);
    }
  }
  
  updateGameTheme() {
    // Update game canvas background and colors based on theme
    if (window.gameEngine && window.gameEngine.updateTheme) {
      window.gameEngine.updateTheme(this.currentTheme);
    }
    
    // Update CSS custom properties for game elements
    const root = document.documentElement;
    if (this.currentTheme === 'dark') {
      root.style.setProperty('--game-bg-start', '#2d3748');
      root.style.setProperty('--game-bg-end', '#4a5568');
      root.style.setProperty('--game-text-shadow', '0 2px 4px rgba(0,0,0,0.8)');
    } else {
      root.style.setProperty('--game-bg-start', '#87ceeb');
      root.style.setProperty('--game-bg-end', '#98d8e8');
      root.style.setProperty('--game-text-shadow', '0 2px 4px rgba(0,0,0,0.3)');
    }
  }
  
  setupEventListeners() {
    // Theme toggle click
    document.addEventListener('click', (e) => {
      if (e.target.id === 'theme-toggle') {
        this.toggleTheme();
      }
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
  
  // Public API
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.applyTheme(theme);
    }
  }
}

// Enhanced UI Manager with theme support
class EnhancedUIManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.enhanceExistingElements();
    this.addModernEffects();
    this.setupAnimations();
  }
  
  enhanceExistingElements() {
    // Enhance buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.classList.contains('theme-toggle')) {
        button.classList.add('btn-enhanced');
      }
    });
    
    // Enhance cards/modals
    const modals = document.querySelectorAll('.modal, .overlay');
    modals.forEach(modal => {
      modal.classList.add('card-enhanced');
    });
    
    // Enhance headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.classList.add('heading-enhanced');
    });
  }
  
  addModernEffects() {
    // Add floating animation to game elements
    const gameContainer = document.querySelector('.game-container, #gameContainer');
    if (gameContainer) {
      gameContainer.classList.add('floating');
    }
    
    // Add glass effect to overlays
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach(overlay => {
      overlay.classList.add('glass-effect');
    });
    
    // Add pulse glow to important buttons
    const startButton = document.querySelector('[onclick*="startGame"], .start-button');
    if (startButton) {
      startButton.classList.add('pulse-glow');
    }
  }
  
  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.card-enhanced, .btn-enhanced');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
  
  // Enhanced modal methods
  showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('glass-effect');
    modal.style.animation = 'slideInRight 0.3s ease-out';
    modal.classList.remove('hidden');
    
    // Add backdrop blur
    document.body.style.backdropFilter = 'blur(5px)';
    
    if (options.autoClose) {
      setTimeout(() => this.hideModal(modalId), options.autoClose);
    }
  }
  
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.backdropFilter = '';
    }, 300);
  }
  
  // Enhanced notification system
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} glass-effect`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      color: var(--theme-text-primary);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
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

// Initialize theme manager and enhanced UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
  window.enhancedUI = new EnhancedUIManager();
  
  // Add some initial flair
  setTimeout(() => {
    if (window.enhancedUI) {
      window.enhancedUI.showNotification('Welcome to Enhanced FlappyBird! 🎮', 'info', 2000);
    }
  }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, EnhancedUIManager };
}

