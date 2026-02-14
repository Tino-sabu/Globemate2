# GlobeMate - Modular Architecture Documentation

## Overview
The GlobeMate application has been successfully refactored into a modular architecture. All navbar sections now have separate HTML and JavaScript files, making the codebase easier to maintain, debug, and extend.

## File Structure

```
Globemate2/
├── index.html              # Main entry point (navbar, footer, content container)
├── css/
│   └── styles.css          # Global styles
├── js/
│   ├── app.js              # Core app (splash screen, utilities, navbar)
│   ├── page-loader.js      # Dynamic page loading system
│   ├── home.js             # Home/Hero page module
│   ├── trip-planner.js     # Trip Planner module
│   ├── country-info.js     # Country Explorer module
│   ├── safety.js           # Safety Center module
│   ├── packing.js          # Packing List module
│   ├── currency.js         # Currency Converter module
│   ├── documents.js        # Document Storage module
│   └── maps.js             # Maps Explorer module
└── pages/
    ├── home.html           # Home/Hero section HTML
    ├── trip-planner.html   # Trip Planner section HTML
    ├── country-info.html   # Country Info section HTML
    ├── safety.html         # Safety section HTML
    ├── packing.html        # Packing section HTML
    ├── currency.html       # Currency section HTML
    ├── documents.html      # Documents section HTML
    └── maps.html           # Maps section HTML
```

## How It Works

### 1. Page Loading System (`page-loader.js`)
- Dynamically loads HTML from `pages/` folder
- Manages page transitions with fade effects
- Calls module initialization (`init()`) when page loads
- Calls module cleanup (`cleanup()`) when leaving page
- Handles navigation via `data-tab` attributes

### 2. Module Structure
Each JavaScript module follows this pattern:

```javascript
(function() {
  'use strict';
  
  const ModuleName = {
    init() {
      // Initialize module when page loads
      this.bindEvents();
      this.loadData();
    },

    bindEvents() {
      // Attach event listeners
    },

    loadData() {
      // Load data from localStorage or APIs
    },

    cleanup() {
      // Clean up before leaving page
    }
  };

  // Expose to global scope
  window.ModuleName = ModuleName;

  // Register with PageLoader
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('page-id', ModuleName);
  }
})();
```

### 3. Navigation Flow
1. User clicks nav link with `data-tab="page-id"`
2. PageLoader intercepts click
3. Calls `cleanup()` on current module
4. Fetches `pages/page-id.html`
5. Injects HTML into `#content-container`
6. Calls `init()` on new module
7. Updates active nav link styling

## Benefits of Modular Architecture

### ✅ Easier Debugging
- Each section's code is isolated in its own file
- Issues with one module don't affect others
- Clear separation of concerns

### ✅ Better Maintainability
- Find and edit specific features quickly
- Add new sections without modifying existing code
- Remove sections by deleting files

### ✅ Improved Performance
- Only load necessary JavaScript
- Proper cleanup prevents memory leaks
- Lazy initialization for heavy features (maps)

### ✅ Team Collaboration
- Multiple developers can work on different modules
- Reduced merge conflicts
- Clear file ownership

## API Usage

### Trip Planner Module
```javascript
TripPlanner.init()           // Initialize module
TripPlanner.saveTrip()       // Save new trip
TripPlanner.deleteTrip(id)   // Delete trip by ID
TripPlanner.viewTrip(id)     // View trip details
```

### Country Explorer Module
```javascript
CountryExplorer.init()                  // Initialize module
CountryExplorer.selectCountry(code)     // Load country by code
CountryExplorer.checkVisa()             // Check visa requirements
```

### Safety Center Module
```javascript
SafetyCenter.init()                     // Initialize module
SafetyCenter.checkSafety()              // Get safety info for country
```

### Packing List Module
```javascript
PackingList.init()                      // Initialize module
PackingList.generateList()              // Generate packing list
PackingList.toggleItem(id)              // Toggle item check status
```

### Currency Converter Module
```javascript
CurrencyConverter.init()                // Initialize module
CurrencyConverter.convert()             // Convert currencies
CurrencyConverter.swap()                // Swap from/to currencies
CurrencyConverter.fetchRates()          // Update exchange rates
```

## Common Patterns

### Saving Data to LocalStorage
```javascript
const data = { /* your data */ };
localStorage.setItem('globemateKey', JSON.stringify(data));
```

### Loading Data from LocalStorage
```javascript
const saved = localStorage.getItem('globemateKey');
const data = saved ? JSON.parse(saved) : [];
```

### Showing Toast Notifications
```javascript
AppUtils.showToast('Success message', 'success');
AppUtils.showToast('Error message', 'error');
AppUtils.showToast('Warning message', 'warning');
```

## Troubleshooting

### Issue: Page not loading
**Solution:** Check that HTML file exists in `pages/` folder with correct name matching `data-tab` attribute.

### Issue: Module not initializing
**Solution:** Ensure module is registered with PageLoader and script is loaded in index.html.

### Issue: Events not working after page switch
**Solution:** Re-attach event listeners in module's `init()` method, not globally.

### Issue: Data persisting between pages
**Solution:** Implement proper `cleanup()` method to reset module state.

## Future Enhancements

- [ ] Add webpack/bundler for optimized builds
- [ ] Implement code splitting for better performance
- [ ] Add TypeScript for type safety
- [ ] Create unit tests for each module
- [ ] Add service worker for offline support
- [ ] Implement proper routing with URL hash/history

## Migration Notes

### Old Structure → New Structure
- `index.html` (monolithic) → `pages/*.html` (modular)
- `app.js` (all code) → `js/*-module.js` (separated)
- TabNav system → PageLoader system
- Manual tab switching → Automatic page loading

### Breaking Changes
- `data-tab="hero"` is now `data-tab="home"`
- Old module references (e.g., direct calls in app.js) won't work
- Must use new module pattern with `init()` and `cleanup()`

## Support

For issues or questions about the modular architecture:
1. Check this documentation
2. Review module code in `js/` folder
3. Inspect PageLoader logic in `js/page-loader.js`
4. Test in browser console using `window.ModuleName` to debug

---

**Last Updated:** 2026  
**Version:** 2.0 (Modular Architecture)
