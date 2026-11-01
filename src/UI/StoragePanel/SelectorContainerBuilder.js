// eligens/src/content/ui/StoragePanel/SelectorContainerBuilder.js

/** Builds selector containers */
class SelectorContainerBuilder {
	constructor( panel ) {
		this.panel = panel; // StoragePanel instance
	}

	/** Build a selector container
	 * @param {string}	selector	- Selector string
	 * @param {string}	slug			- Slug string
	 * @param {boolean}	fromFile	- True if selector was loaded from a file
	 */
	build( selector, slug, fromFile = false ) {
		const container = this._createContainer( fromFile );
		const slugInput = this._createSlugInput( slug );
		const item      = this._createSelectorItem( selector );
		const deleteBar = this._createDeleteBar( container );

		container.append( slugInput, item, deleteBar );
		return container;
	}

	/** Create a selector container
	 * @param {boolean} fromFile - True if selector was loaded from a file
	 */
	_createContainer( fromFile ) {
		const container = DomUtils.create( 'selector-container' );
		if( !fromFile ) {												// if selector was not loaded from file
			container.classList.add( 'unsaved' ); // mark as unsaved
		}
		return container;
	}

	/** Create a slug input and set its value */
	_createSlugInput( slug ) {
		const input	= DomUtils.create(
			'selector-key', null, null, 'input'
		);
		input.type	= 'text';
		input.value	= slug;

		// Sanitize on input
		input.addEventListener( 'input', () => {
			const original	= input.value;
			const sanitized	= this.panel.slugManager.sanitize( original );

			if( sanitized !== original ) {
				input.value = sanitized;
			}

			// Update invalid and duplicate states
			this.panel.stateManager.updateInvalidStates();
			this.panel.stateManager.updateDuplicateStates();
		} );

		return input;
	}

	/** Create a selector item from a selector */
	_createSelectorItem( selector ) {
		const item = DomUtils.create(
			'selector-value', null, selector
		);

		// Highlight on hover
		item.addEventListener( 'mouseover', () => {
			Highlighter.highlightMatches(selector);
		} );
		item.addEventListener( 'mouseout', () => {
			Highlighter.clearHighlights();
		} );

		return item;
	}

	/** Create a delete bar */
	_createDeleteBar( container ) {
		const bar = DomUtils.create( 'selector-storage-delete-bar', null, '×' );
		bar.title = 'Remove selector';

		bar.onclick = () => {
			container.remove();
			queueMicrotask( () => this.panel.stateManager.updateDuplicateStates() );
		};

		return bar;
	}
}
