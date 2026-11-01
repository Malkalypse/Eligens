// eligens/src/UI/ComponentsMenu/PseudoclassMenuController.js

/** Controller for pseudoclass menu */
class PseudoclassMenuController {

	/** Constructor
	 * @param {HTMLElement} menu   - The menu element to populate
	 * @param {HTMLElement} unit   - The selector chain bar unit
	 * @param {Object} context     - Pseudoclass context (isOptions, hasOptions, notOptions, structural)
	 */
	constructor( menu, unit, context ) {
		this.menu			= menu;
		this.unit			= unit;
		this.context	= context;
		this.color		= "#10b981"; // consistent pseudoclass color

		this._addStructural();
		this._addDropdownSections();
	}

	/** Add list of structural pseudoclasses */
	_addStructural() {
		this._addList( this.context.structural );
		const separator = DomUtils.create( "separator" );
		this.menu.appendChild( separator );
	}
	_addList( items ) {
		items.forEach( sel => {
			const opt = this._createItem( sel, null );
			this.menu.appendChild( opt );
		} );
	}

	/** Add dropdown pseudoclass sections */
	_addDropdownSections() {
		this._addDropdownSection( ":is()",  this.context.isOptions );
		this._addDropdownSection( ":has()", this.context.hasOptions );
		this._addDropdownSection( ":not()", this.context.notOptions );
	}

	/** Add dropdown section for a category of pseudoclasses
	 * @param {string}				title	- Title of section
	 * @param {Array<string>}	items	- Pseudoclasses to add
	 */
	_addDropdownSection( title, items ) {
		if( !items.length ) return;

		const section = this._createDropdownSection( title, items );
		this.menu.append( section.header, section.list );
	}

	/** Create a dropdown section */
	_createDropdownSection(title, items) {
		const header = DomUtils.create( "components-menu-header", null, title );
		const list   = this._createDropdownList( items, title );

		this._wireDropdownToggle( header, list );
		return { header, list };
	}

	/** Create a list of pseudoclasses for a dropdown section */
	_createDropdownList( items, wrapperType ) {
		const list = DomUtils.create();
		list.style.display = "none";

		// Add pseudoclass items to list
		items.forEach( sel => {
			const opt = this._createItem( sel, wrapperType );
			list.appendChild( opt );
		} );

		return list;
	}

	/** Set event listener for dropdown toggle */
	_wireDropdownToggle( header, list ) {
		let expanded = false;

		header.addEventListener( "click", ( e ) => {
			e.stopPropagation();
			expanded = !expanded;
			list.style.display = expanded ? "block" : "none";
		} );
	}

	// #region Pseudoclass Items
  /** Create a pseudoclass item */
	_createItem( sel, wrapperType ) {
		const displaySel  = this._normalizeDisplaySelector( sel );
		const finalSel    = this._wrapSelector( displaySel, wrapperType );
		const opt         = this._createOptionElement( displaySel );

		// Disable if segment is empty
		if( this.unit.classList.contains( "segment-empty" ) ) {
			this._disable( opt );
			return opt;
		}

		this._applyActiveState( opt, finalSel );
		this._wireActiveToggle( opt, finalSel );

		return opt;
	}

  /** Remove wrapper for component menu display */
	_normalizeDisplaySelector( sel ) {
		return sel.replace( /^:(not|is|has)\((.*)\)$/, "$2" );
	}

  /** Restore wrapper for display in selector chain bar */
	_wrapSelector( displaySel, wrapperType ) {
		switch( wrapperType ) {
			case ":not()": return `:not(${displaySel})`;
			case ":is()":  return `:is(${displaySel})`;
			case ":has()": return `:has(${displaySel})`;
			default:       return displaySel;
		}
	}

  /** Create option element for pseudoclass item */
	_createOptionElement( displaySel ) {
		const opt = DomUtils.create(
			"components-menu-item pseudoclass", null,
			displaySel
		);
		opt.style.color = this.color;
		return opt;
	}

  /** Set active state for pseudoclass */
	_applyActiveState( opt, finalSel ) {
		const segment = this.unit.querySelector(".selector-segment");
		if( segment.textContent.includes( finalSel ) ) {
			opt.classList.add( "active-component" );
		}
	}

  /** Set event listener for active-component toggle */
	_wireActiveToggle( opt, finalSel ) {
		opt.addEventListener( "click", () => {
			if( opt.classList.contains( "disabled-component" ) ) return;

			const state     = this.unit.segmentState;
			const idx       = state.pseudoclasses.indexOf( finalSel );
			const isActive  = idx !== -1;

			this.unit.manager.togglePseudoclass( finalSel );
			opt.classList.toggle( "active-component", !isActive );
		} );
	}
	// #endregion Pseudoclass Items

  /** Update pseudoclass menu */
	update() {
		const isEmpty = this.unit.classList.contains( "segment-empty" );
		const items = this.menu.querySelectorAll( ".components-menu-item.pseudoclass" );

		items.forEach(item => {
			item.classList.toggle( "disabled-component", isEmpty );
		} );
	}

  // #region Helpers
	_enable( opt ) {
		opt.classList.remove( "disabled-component" );
	}
	_disable( opt ) {
		opt.classList.add( "disabled-component" );
	}
  // #endregion Helpers
}
