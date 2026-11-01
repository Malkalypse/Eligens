# Eligens

A visual CSS inspector for clicking any element on a page and instantly building a selector for it, through an interactive chain that can be refined, previewed, and copied.

## Overview

Eligens is an extension that adds a context menu option to Chromium browsers, allowing you to instantly visualize its CSS selector path from the document root. Each segment in the chain is interactive: toggle tags, classes, and pseudoclasses to refine the selector in real time, with live highlighting of all matching elements.

The extension includes a persistent storage panel for saving selector collections to local JSON files using the File System Access API.

## Features

| Feature | Description |
|---------|-------------|
| **Context Menu Integration** | Right-click any element → "Open Eligens Inspector" |
| **Selector Chain Bar** | Visual breadcrumb trail from `<html>` to the target element |
| **Interactive Segments** | Toggle tag, classes, and pseudoclasses per segment via context menu |
| **Live Highlighting** | Hover a segment to highlight all DOM elements matching the selector |
| **Pseudoclass Support** |
|  - Structural: | `:nth-child()`, `:last-child`, `:nth-of-type()`, `:last-of-type` |
|  - Functional: | `:is()`, `:has()`, `:not()` with intelligent candidate filtering |
| **Storage Panel** | Persist selector collections to JSON files (create, open, save, clear) |
| **Duplicate & Invalid Detection** | Visual indicators for duplicate slugs and invalid keys |
| **Toast Notifications** | Feedback for copy actions and status updates |
| **Resizable Panels** | Drag handle to resize the storage panel |

## Installation

### Chrome

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `eligens` directory (the one containing `manifest.json`)

### Edge

1. Clone or download this repository
2. Open Edge and navigate to `edge://extensions/`
3. Enable **Developer mode** (bottom-left toggle)
4. Click **Load unpacked**
5. Select the `eligens` directory (the one containing `manifest.json`)

The extension will appear in your toolbar. No build step is required—all source files are loaded directly as content scripts.

## How To Use It

### Opening the Inspector

1. Right-click any element on a page
2. Select **Open Eligens Inspector** from the context menu
3. A selector chain bar appears at the bottom of the viewport

### Working with the Selector Chain

| Action | Result |
|--------|--------|
| Hover a segment | Highlights all elements matching the selector up to that segment |
| Right-click a segment | Opens component menu to toggle tag, classes, pseudoclasses |
| Click "Set as Target" | Truncates the chain at that segment (makes it the new target) |
| Press `Escape` | Closes the inspector and clears highlights |

### Component Menu (Right-click a Segment)

| Component | Action |
|-----------|--------|
| **Tag toggle** | Enable/disable the element's tag name in the selector |
| **Class toggles** | Enable/disable individual classes |
| **Structural pseudoclasses** | `:nth-child(n)`, `:last-child`, `:nth-of-type(n)`, `:last-of-type` |
| **Functional pseudoclasses** | `:is(...)`, `:has(...)`, `:not(...)` with auto-generated valid options |

### Storage Panel

Click the `+` toggle on the right edge to open the storage panel.

| Button | Action |
|--------|--------|
| **Create File** | Prompts for a new `.json` file and switches to save mode |
| **Open File** | Loads selectors from an existing `.json` file |
| **Save to File** | Writes current selectors to the open file |
| **Clear** | Closes the current file and returns to create mode |

Selectors are stored as key-value pairs (slug → selector). Slugs are auto-generated from the selector text but can be edited inline.

## Configuration

No configuration file is required. The extension uses the following permissions (declared in `manifest.json`):

| Permission | Purpose |
|------------|---------|
| `contextMenus` | Adds "Open Eligens Inspector" to right-click menu |
| `activeTab` | Access to the current tab's DOM |
| `scripting` | Inject content scripts |
| `clipboardWrite` | Copy selector to clipboard (toast feedback) |
| `downloads` | Save selector files via background script |

## Architecture

### Folder Structure

```
eligens/
├── manifest.json              # Manifest V3 configuration
├── css/
│   ├── styles.css             # Main extension styles
│   └── toast.css              # Toast notification styles
└── src/
    ├── Background/
    │   └── BackgroundManager.js       # Context menu + download handling
    ├── Managers/
    │   ├── ComponentsManager.js       # Per-segment state (tag, classes, pseudoclasses)
    │   ├── PanelStateManager.js       # Storage panel validation (duplicates, invalid slugs)
    │   └── PseudoclassManager.js      # Structural & functional pseudoclass logic
    ├── UI/
    │   ├── ComponentsMenu/
    │   │   ├── ComponentsMenu.js               # Context menu for a selector unit
    │   │   └── PseudoclassMenuController.js    # Pseudoclass dropdown sections
    │   ├── StoragePanel/
    │   │   ├── SelectorContainerBuilder.js     # Builds selector list items
    │   │   ├── StoragePanelEvents.js           # File open/create/save/clear handlers
    │   │   └── StoragePanel.js                 # Main storage panel UI + toggle
    │   ├── SelectorChainBar.js         # Visual breadcrumb bar + selector building
    │   └── ToastNotification.js        # Toast messages (extends Toast base)
    ├── TogglePanel/
    │   └── TogglePanelController.js    # Reusable panel open/close logic
    ├── Utils/
    │   ├── DomUtils.js                 # DOM query/creation helpers
    │   ├── FileHandler.js              # File System Access API wrappers
    │   ├── safeUtils.js                # Resize behavior for drag bars
    │   └── SlugManager.js              # Slug sanitization & validation
    ├── Toast/
    │   └── Toast.js                    # Base toast notification class
    ├── EligensInspector.js             # Main entry point, orchestrates inspector
    ├── Highlighter.js                  # Creates/removes highlight overlays
    └── SelectorBuilder.js              # Builds selector segments & chains
```

### Design Patterns

**Static Class Managers**
- `SelectorBuilder`, `Highlighter`, `PseudoclassManager`, `DomUtils`, `FileHandler`, `SlugManager` are stateless utility classes with static methods

**Instance Controllers**
- `ComponentsManager`, `PanelStateManager`, `SelectorChainBar`, `StoragePanel`, `TogglePanelController`, `ComponentsMenu`, `PseudoclassMenuController` hold state per UI instance

**Event-Driven UI**
- Mouseover, click, contextmenu, and keyboard events drive interactions

**Delegation**
- `EligensInspector` coordinates between `SelectorChainBar`, `StoragePanel`, and `Highlighter`

### Selector Building Flow

1. User right-clicks element → `EligensInspector.lastRightClicked` captures target

2. Background script sends `openEligensInspector` message → `EligensInspector.open()`

3. `SelectorBuilder.buildSelectorChain(target)` walks up the DOM to root, returns element array

4. `SelectorChainBar` creates a `.selector-unit` for each element with a `.selector-segment`

5. Each unit gets a `ComponentsManager` instance tracking active tag/classes/pseudoclasses

6. On hover, `SelectorChainBar._buildSelectorFrom(index)` builds a selector string from root to that unit

7. `Highlighter.highlightMatches(selector)` applies `.selector-overlay` divs to all matching elements

### Pseudoclass Generation

`PseudoclassManager` computes valid pseudoclasses in two categories:

- **Structural** — Based on element position among siblings (`:nth-child`, `:last-child`, `:nth-of-type`, `:last-of-type`)

- **Functional** (`:is`, `:has`, `:not`) — Collects candidate selectors from the element (and peers/descendants), then filters to only those that distinguish the target from its peers (i.e. some match, some don't)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test in Chrome (Developer mode → reload extension)
5. Submit a pull request

### Code Style

- ES6 classes with static methods for utilities, instance methods for stateful controllers
- JSDoc comments for public methods
- `#region` / `#endregion` comments for folding in editors that support it
- 1 tab indentation (as used throughout the codebase)

## License

MIT License — see `LICENSE` file for details