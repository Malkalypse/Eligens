// eligens/src/content/ui/StoragePanel/StoragePanel.js

/** Handles storage panel UI */
class StoragePanel {
	constructor() {

		// Core managers
		this.fileHandler       = new FileHandler();
		this.containerBuilder  = new SelectorContainerBuilder(this);
		this.stateManager      = new PanelStateManager(this);
		this.slugManager       = new SlugManager();
		this.events            = new StoragePanelEvents(this);

		// DOM refs
		this.panel         = null;
		this.filepathField = null;
		this.clearBtn      = null;
		this.createBtn     = null;
		this.saveBtn       = null;

		// Build + wire
		this._ensurePanel();
		this._setupToggle();
		this.events.wire();
	}

	// #region Panel Creation
	/** Create panel if it doesn't exist */
	_ensurePanel() {

		// Get existing panel
		if( DomUtils.exists( "selector-storage-panel" ) ) {
			this.panel = DomUtils.byId( "selector-storage-panel" );
			return;
		}

		// Create panel
		this.panel = DomUtils.create( null, "selector-storage-panel" );
		this._addDragBar();
		this._addSections();
		document.body.appendChild( this.panel );
	}

	/** Add drag bar for resizing */
	_addDragBar() {
		const dragBar = DomUtils.create( null, "selector-storage-dragbar" );
		this.panel.appendChild( dragBar );
		safeUtils.applyResizeBehavior( dragBar, this.panel );
	}

	// #region Add Sections
	_addSections() {
		this._createHeader();
		this._createList();
		this._createFooter();
	}
	_createHeader() {
		const header = DomUtils.create( "selector-storage-header" );
		const title  = DomUtils.create( "selector-storage-title", null, "Selectors" );
		header.appendChild( title );
		this.panel.appendChild( header );
	}
	_createList() {
		const list = DomUtils.create( "selector-storage-list", "selector-storage-list" );
		this.panel.appendChild( list );
	}

	// #region Add Footer
	_createFooter() {
		const footer				= DomUtils.create( "selector-storage-footer" );
		const filepathField	= DomUtils.create(
			"selector-storage-filepath", "selector-storage-filepath",
			"No file selected"
		);
		const clearBtn	= this._buildClearButton();
		const createBtn	= DomUtils.create(
			"selector-storage-create-btn", null,
			"Create File", "button"
		);
		const saveBtn = this._buildSaveButton();

		filepathField.appendChild( clearBtn );

		this._storeFooterRefs( {filepathField, clearBtn, createBtn, saveBtn} );

		footer.append( filepathField, createBtn, saveBtn );
		this.panel.appendChild( footer );
	}
	_buildClearButton() {
		const btn = DomUtils.create( "selector-storage-clear-btn", null, "×" );
		btn.title = "Clear file selection";
		return btn;
	}
	_buildSaveButton() {
		const btn = DomUtils.create(
			"selector-storage-save-btn", null,
			"Save to File", "button"
		);
		btn.style.display = "none";
		return btn;
	}
	_storeFooterRefs( {filepathField, clearBtn, createBtn, saveBtn} ) {
		this.filepathField = filepathField;
		this.clearBtn      = clearBtn;
		this.createBtn     = createBtn;
		this.saveBtn       = saveBtn;
	}
	// #endregion Create Footer

	// #endregion Add Sections

	// #endregion Panel Creation

	/** Toggle visibility of selector storage panel */
	_setupToggle() {
		const storageToggle = new TogglePanelController( {
			toggleId: "selector-storage-toggle",
			panelId:  "selector-storage-panel",

			minimize: {
				parentSelector: ".selector-storage-header",
				className:      "selector-storage-toggle-btn"
			},

			onOpen: panel => {
				const chainBar = EligensInspector.chainBar
				if( chainBar ) chainBar.bar.style.right = panel.style.width;
			},

			onClose: () => {
				const chainBar = EligensInspector.chainBar
				if( chainBar ) chainBar.bar.style.right = 0;
			}
		} );

		storageToggle.init();
	}

	// #region Mode Toggle
	switchToSaveMode() {
		this.createBtn.style.display = "none";
		this.saveBtn.style.display   = "inline-block";
	}

	switchToCreateMode() {
		this.saveBtn.style.display   = "none";
		this.createBtn.style.display = "inline-block";
	}
	// #endregion Mode Toggle

	/** Add a new selector to the storage panel */
	addSelector(selector, keyOverride = null, fromFile = false) {

		// Get list of selectors in panel
		const list = DomUtils.byId( "selector-storage-list" );
		if( !list ) return;

		// Generate key slug from selector
		const key = this.slugManager.resolveSlug( selector, keyOverride );

		// Find containers with matching key
		const matches = DomUtils.getAll( ".selector-container" )
			.filter( container => {
				const k = container.querySelector( ".selector-key" ).value.trim();
				return k === key;
			} );

		if( matches.length === 0 ) { // if no containers with this key

			// Add new container
			const container = this.containerBuilder.build( selector, key, fromFile );
			list.appendChild( container );
			this.stateManager.refresh();
			return;
		}

		if( fromFile ) { // if selector was loaded from file

			// Check containers with matching key for matching value
			const exactMatch = matches.find( container => {
				const value = container.querySelector( ".selector-value" ).textContent.trim();
				return value === selector;
			} );

			if( exactMatch ) {													// if there is an exact match							
				exactMatch.classList.remove( "unsaved" );	// mark as saved
			} else {																		// otherwise

				// Add new container
				const container = this.containerBuilder.build( selector, key, true );
				list.appendChild( container );
			}

			this.stateManager.refresh();
		}
	}

	/** Load selectors from JSON */
	loadJson( json ) {
		for( const key in json ) {
			const selector = json[key];
			this.addSelector( selector, key, true );
		}
		this.stateManager.refresh();
	}

	/** Get all selectors in panel */
	getSelectors() {

		// Get list of selectors
		const list = document.getElementById( "selector-storage-list" );
		if( !list ) return [];

		// For each selector container, get slug and selector
		return [...list.querySelectorAll( ".selector-container" )].map( container => {
			const slug     = container.querySelector( ".selector-key" ).value.trim();
			const selector = container.querySelector( ".selector-value" ).textContent.trim();
			return {slug, selector}; // TODO: change to {key, value}
		} );
	}

	/** Mark all unsaved selectors as saved */
	markSelectorsAsSaved() {
		document.querySelectorAll( ".selector-container.unsaved" )
			.forEach( el => el.classList.remove( "unsaved" ) );
	}
}
