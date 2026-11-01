// eligens/src/content/ui/SelectorChainBar.js

/** Manages selector chain bar UI */
class SelectorChainBar {

	constructor( selectorChain ) {
		this.selectorChain	= selectorChain;
		this.storage				= EligensInspector.storagePanel;
		this.bar						= DomUtils.create( null, 'selector-chain-bar' );

		this._addCloseButton();
		this._addUnits();			// add selector chain units to selector chain bar
		this._positionBar();	// adjust right side of selector chain bar */
		this._wireKeyboardShortcuts();
	}

	// #region Create Selector Chain Bar Elements
	_addCloseButton() {
		const closeBtn = DomUtils.create( 'selector-chain-close', null, '×' );
		closeBtn.addEventListener( 'click', () => this.close() );
		this.bar.appendChild( closeBtn );
	}

	/** Add selector chain units to selector chain bar */
	_addUnits() {
		this.selectorChain.forEach( ( node, index) => {
			this.bar.appendChild( this._createUnit( node, index ) );
		} );
		document.body.appendChild( this.bar );
	}

	/** Create a single selector unit
	 * @param {HTMLElement}	node	- The DOM element
	 * @param {number}			index	- Index in the chain
	 * @returns {HTMLElement} The created unit element
	 */
	_createUnit( node, index ) {
		const unit = this._createUnitElement( index );	// create selector unit element
		this._appendSegment( unit, node );							// append segment to selector unit
		this._appendCombinator( unit, index );					// append combinator to selector unit
		this._setupUnitEvents( unit, node, index );			// setup event listeners for selector unit
		return unit;
	}

	/** Create selector unit element */
	_createUnitElement( index ) {
		const unit = DomUtils.create( 'selector-unit' );
		unit.dataset.index = index;
		return unit;
	}

	/** Append segment to selector unit */
	_appendSegment( unit, node ) {
		const segment = DomUtils.create(
			'selector-segment', null,
			SelectorBuilder.buildSelectorSegment( node ), 'span'
		);
		unit.appendChild( segment );
	}

	/** Append combinator to selector unit */
	_appendCombinator( unit, index ) {
		if( index < this.selectorChain.length - 1 ) {
			const combinator = DomUtils.create(
				'selector-combinator', null,
				'>', 'span'
			);
			unit.appendChild( combinator );
		}
	}
	// #endregion Create Selector Chain Bar Elements

	// #region Event Handlers
	_setupUnitEvents( unit, node, index ) {
		this._setupMouseOver( unit, index );
		this._setupMouseOut( unit );
		this._setupClick( unit, index );

		unit.addEventListener( 'contextmenu', event => {
			new ComponentsMenu( unit, node, event );
		} );
	}

	// #region Mouseover
	/** Setup mouseout event for a selector unit */
	_setupMouseOver( unit, index ) {
		unit.addEventListener( 'mouseover', () => {
			const selector = this._buildSelectorFrom( index );
			Highlighter.highlightMatches( selector );
			this._updateUnitVisualization( index );
		} );
	}

	/** Update unit visualization
	 * @param {number} index - Index of the hovered unit in the chain
	*/
	_updateUnitVisualization( index ) {
		this._resetUnitVisualization();
		const allUnits = this.getUnits();

		allUnits.forEach( ( u, i ) => {
			if( i < index ) u.classList.add( 'dimmed' );
			else if( i === index ) u.classList.add( 'active' );
			else u.classList.add( 'highlighted' );
		});
	}
	// #endregion Mouseover

	/** Setup mouseout event for a selector unit */
	_setupMouseOut( unit ) {
		unit.addEventListener( 'mouseout', () => {
			Highlighter.clearHighlights();
			this._resetUnitVisualization();
		} );
	}

	// #region Click
	_setupClick( unit, index ) {
		unit.addEventListener( 'click', () => {
			if( unit.classList.contains( 'segment-empty' ) ) return;

			const selector = this._buildSelectorFrom( index );
			navigator.clipboard.writeText( selector );
			this._notifySelectorCopied( selector );
		} );
	}
	_notifySelectorCopied( selector ) {
		ToastNotification.show( selector );
		this.storage.addSelector( selector );
	}
	// #endregion Click

	/** Wire keyboard shortcuts */
	_wireKeyboardShortcuts() {
		document.addEventListener( 'keydown', e => {
			if( e.key === 'Escape' ) this.close();
		} );
	}

	/** Reset visualization for all selector units */
	_resetUnitVisualization() {
		this.getUnits().forEach( u =>
			u.classList.remove( 'dimmed', 'active', 'highlighted' )
		);
	}
	// #endregion Event Handlers

	// #region Build Selector
	/** Build selector from bar units starting at a specific index */
	_buildSelectorFrom( startIndex = 0 ) {
		const units = this.getUnits();
		return this._buildSelectorRange( startIndex, units.length - 1 );
	}

	/** Build selector from bar units ending at a specific index */
	buildSelectorTo( endIndex ) {
		return this._buildSelectorRange( 0, endIndex );
	}

	/** Build selector from bar units in a range */
	_buildSelectorRange( startIndex, endIndex ) {
		const units = this.getUnits();
		const parts = [];

		for( let i = startIndex; i <= endIndex; i++ ) {

			// Get selector unit
			const unit = units[i];
			if( !this._shouldIncludeUnit( unit ) ) continue;

			// Get selector segment
			const segment = this.getUnitSegment( unit );
			if( !segment ) continue;

			parts.push( segment ); // append segment

			// Suppress combinator after last unit in specified range
			const isLast = i === endIndex;
			if( !isLast && this._unitHasVisibleCombinator( unit, i, units ) ) {
				parts.push( '>' );
			}
		}

		return parts.join( ' ' );
	}

	/** Check if selector unit should be included in selector */
	_shouldIncludeUnit( unit ) {
		return !unit.classList.contains( 'segment-empty' );
	}

	/** Get the text content of a selector unit */
	getUnitSegment( unit ) {
		const seg = unit.querySelector( '.selector-segment' );
		return seg ? seg.textContent.trim() : '';
	}

	_unitHasVisibleCombinator( unit, index, units ) {
		const comb		= unit.querySelector( '.selector-combinator' );
		const isLast	= index === units.length - 1;
		return comb && comb.style.display !== 'none' && !isLast;
	}
	// #endregion Build Selector

	/** Get all selector units in the bar */
	getUnits() {
	  return DomUtils.getAll( '#selector-chain-bar .selector-unit' );
	}

	/** Close selector chain bar */
	close() {
	  this.bar.remove();
	  Highlighter.clearHighlights();
	}

	/** Adjust right side of selector chain bar */
  _positionBar() {
		const panel = DomUtils.byId( 'selector-storage-panel' );
		if( panel ) this.bar.style.right = panel.style.width;
  }

	/** Update combinator visibility */
  updateCombinators() {
		const units = this.getUnits(); // get all selector units

		units.forEach( ( unit, i ) => {
		  const isEmpty = unit.classList.contains( 'segment-empty' );

		  // Get current unit combinator
		  const currentComb = unit.querySelector( '.selector-combinator' );

		  // Get previous unit combinator
		  const prevUnit = units[i - 1];
		  const prevComb = prevUnit ? prevUnit.querySelector( '.selector-combinator' ) : null;

		  if( isEmpty ) {
				if( currentComb ) currentComb.style.display = 'none';	// hide current unit combinator
				if( prevComb ) prevComb.style.display = 'none';				// hide previous unit combinator
		  } else {
				if( currentComb ) currentComb.style.display = '';			// restore combinator inside this unit

				// Restore previous unit combinator (if not empty)
				if( prevUnit && !prevUnit.classList.contains( 'segment-empty' ) ) {
				  if( prevComb ) prevComb.style.display = '';
				}
		  }
		} );
  }
}
