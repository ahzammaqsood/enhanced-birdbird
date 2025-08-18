# BirdBird Game

A modern, responsive HTML5 canvas game inspired by Flappy Bird. Built with vanilla JavaScript for optimal performance across all devices.

## Features

- **Responsive Design**: Optimized for both desktop and mobile devices
- **Customizable Settings**: Adjust game speed, difficulty, and audio preferences
- **Local Leaderboard**: Track your progress and compete with yourself
- **Smooth Performance**: 60 FPS gameplay with optimized rendering
- **Accessibility**: Keyboard, mouse, and touch support with proper ARIA labels
- **Professional UI**: Clean, modern interface with smooth animations

## Game Controls

- **Desktop**: Click, Spacebar, or any key to flap
- **Mobile**: Tap anywhere on the screen
- **Settings**: Escape key to open settings during gameplay

## Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No additional setup required - it's a pure HTML5 game!

## Configuration

### Default Settings
- **Game Speed**: 120% (optimized for smooth gameplay)
- **Difficulty**: Hard (provides the best gaming experience)
- **Sound**: Enabled
- **FPS Display**: Disabled

### AdSense Integration
To add your own AdSense ads:

1. Replace the ad placeholder content in `index.html` with your AdSense code
2. Update the ad slots in these locations:
   - Top banner ad
   - Left sidebar ad (desktop)
   - Right sidebar ad (desktop)
   - Mobile bottom ad
   - Inline ad (leaderboard section)
   - Floating ad (desktop)

### URL Structure
The game uses hash-based routing for a single-page application:
- `/#home` - Main game
- `/#leaderboard` - High scores
- `/#blog` - Game tips and strategies
- `/#about` - Game information
- `/#privacy` - Privacy policy

## Technical Details

- **Framework**: Vanilla HTML5, CSS3, and JavaScript
- **Canvas Rendering**: Optimized 2D canvas with 60 FPS target
- **Storage**: Local storage for scores and settings
- **Performance**: Frame-rate independent physics with delta time
- **Compatibility**: Works on all modern browsers

## File Structure

```
├── index.html              # Main HTML file
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── base.css           # Base styles and reset
│   ├── header.css         # Navigation styles
│   ├── game.css           # Game-specific styles
│   ├── components.css     # Reusable components
│   ├── ads.css            # Advertisement styles
│   ├── footer.css         # Footer styles
│   └── sections.css       # Section-specific styles
├── js/
│   ├── game-config.js     # Game configuration
│   ├── audio-manager.js   # Audio system
│   ├── leaderboard.js     # Score management
│   ├── game-engine.js     # Core game logic
│   ├── ui-manager.js      # User interface
│   └── main.js            # Application initialization
└── assets/
    ├── images/            # Game sprites
    └── audio/             # Sound effects
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Frame-rate independent physics
- Efficient canvas rendering
- Optimized asset loading
- Responsive image scaling
- Memory-conscious object pooling

## License

This project is open source and available under the MIT License.