// eligens/src/content/ui/TogglePanel/TogglePanelController.js

/** Set up toggle panel */
class TogglePanelController {

	/** Constructor
		* @param {Object}		options
		* @param {string}		options.toggleId	- ID of toggle button
		* @param {string}		options.panelId		- ID of panel
		* @param {Object}		options.minimize	- Options for minimize button
		* @param {function}	options.onOpen		- Function to call when panel is opened
		* @param {function}	options.onClose		- Function to call when panel is closed
	*/
	constructor( {
		toggleId,
		panelId,
		minimize	= {},
		onOpen		= () => {},
		onClose		= () => {}
	} ) {

		// Set minimize button defaults
		const defaultMinimize = {
			parentSelector:	null,
			tag:						'div',
			id:							null,
			className:			'minimize',
			text:						'-',
			title:					'Minimize'
		};

		// Merge defaults with overrides
		this.minimize = { ...defaultMinimize, ...minimize };

		// Set properties
		this.toggleId	= toggleId;
		this.panelId	= panelId;
		this.onOpen		= onOpen;
		this.onClose	= onClose;

		// Initialize elements
		this.panel				= null;
		this.toggle				= null;
		this.minimizeBtn	= null;
	}

	/** Initialize */
	init() {
		if( DomUtils.exists( this.toggleId ) ) return; // already initialized

		// Create toggle button
		this.toggle = DomUtils.create( 'div', this.toggleId, '+' );
		this._wireToggleBehavior();
		document.body.appendChild( this.toggle );	

		this.panel = DomUtils.byId( this.panelId );			// store panel
		if( this.panel ) this._attachMinimizeButton();	// attach minimize button
	}

	/** Wire behavior of toggle button */
	_wireToggleBehavior() {
		this.toggle.addEventListener( 'click', () => {
			if( !this.panel ) return;

			// Show panel
			this.panel.style.display	= 'flex';
			this.toggle.style.display	= 'none';

			this.onOpen( this.panel ); // perform open callback
		} );
	}

	// #region Minimize Button
	/** Add minimize button to panel */
	_attachMinimizeButton() {

		// Get parent element for minimize button 
		const parent = this.panel.querySelector( this.minimize.parentSelector );
		if( !parent ) return;

		const { className, id, text, tag, title } = this.minimize; // destructure options

		// Create and store minimize button
		this.minimizeBtn = DomUtils.create( className, id, text, tag );
		if( title ) this.minimizeBtn.title = title;

		parent.appendChild( this.minimizeBtn );

		this._wireMinimizeBehavior(); // wire minimize behavior
	}

	/** Wire behavior of minimize button */
	_wireMinimizeBehavior() {
		this.minimizeBtn.addEventListener( 'click', () => {
			this.panel.style.display = 'none';										// hide panel
			if( this.toggle ) this.toggle.style.display = 'flex'; // show toggle

			this.onClose( this.panel ); // perform close callback
		} );
	}
	// #endregion Minimize Button
}
