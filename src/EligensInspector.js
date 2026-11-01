// eligens/src/content/EligensInspector.js

/** Main inspector class to orchestrate selector inspection */
class EligensInspector {

	/** Track the element that was right-clicked
	 * @type {HTMLElement|null}
	 */
	static lastRightClicked = null;

  // #region Initialization
	/** Initialize the inspector */
  static init() {
    this._setupRightClickTracking();
    this._setupMessageListener();
    this.storagePanel = new StoragePanel();
  }

  /** Track right clicked elements */
  static _setupRightClickTracking() {
    document.addEventListener( 'contextmenu', ( e ) => {
      this.lastRightClicked = e.target;
    } );
  }

  /** Handle messages from the background script */
  static _setupMessageListener() {
    chrome.runtime.onMessage.addListener( ( msg ) => {
      if( msg.action === 'openEligensInspector' ) {
        this.open();
      }
    } );
  }
  // #endregion Initialization

  // #region Open Inspector
	/** Open selector inspector for right-clicked element */
  static open() {
    if( !this.lastRightClicked ) return;

    const chain = SelectorBuilder.buildSelectorChain( this.lastRightClicked );
    this._resetInspectorUI();
    this._renderInspector( chain );
  }

  /** Remove existing inspector UI and clear highlights */
  static _resetInspectorUI() {
    if (this.chainBar) this.chainBar.close();
    Highlighter.clearHighlights();
  }

  /** Render the selector chain bar and toast container */
  static _renderInspector( selectorChain ) {
    this.chainBar = new SelectorChainBar(selectorChain);
    ToastNotification.init();
  }
  // #endregion Open Inspector
}

// Export for use in other modules
if( typeof module !== 'undefined' && module.exports ) {
	module.exports = EligensInspector;
}

// Initialize when DOM is ready
if( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => EligensInspector.init() );
} else {
	EligensInspector.init();
}
