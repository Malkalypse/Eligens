// eligens/src/background/BackgroundManager.js

/** Manages extension's background context menu */
class BackgroundManager {

	/** Initialize the background manager */
	static init() {

		// Create context menu on extension install
		chrome.runtime.onInstalled.addListener( () => {
			this.createContextMenu();
		} );

		// Handle context menu clicks
		chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
			if( info.menuItemId === 'openEligensInspector' ) {
				chrome.tabs.sendMessage(
          tab.id,
          { action: 'openEligensInspector' }
        );
			}
		} );

    // Handle messages from the content script
    chrome.runtime.onMessage.addListener( ( msg, sender, sendResponse ) => {
      if( msg.action === "saveSelectorsToFile" ) {
        chrome.downloads.download( {
          url: msg.url,
          filename: msg.filename,
          saveAs: true
        } );
      }
    } );
	}

	/** Create the context menu item */
	static createContextMenu() {
		chrome.contextMenus.create( {
			id:       'openEligensInspector',
			title:    'Open Eligens Inspector',
			contexts: ['all']
		} );
	}
}

// Initialize the background manager
BackgroundManager.init();

// Export for use in other modules
if( typeof module !== 'undefined' && module.exports ) {
	module.exports = BackgroundManager;
}
