// eligens/src/UI/ComponentsMenu/ComponentsMenu.js

/** Show context menu for selector unit */
class ComponentsMenu {

	constructor( unit, target, event ) {
		this.unit   = unit;
		this.target = target;
		this.event  = event;

		event.preventDefault();

		// Remove any prior menus
		DomUtils.removeAll( ".components-menu" );

		// Ensure manager exists
		if (!unit.manager) {
			unit.manager = new ComponentsManager( unit, target );
		} else {
			unit.manager.target = target;
		}

		unit.selectorElement = target;

		// Collect context data
		this.data = this._getComponentsData(target, unit);

		// Create menu element
		this.menu = DomUtils.create("components-menu");

		// Build menu
		this._addSetTargetOption();
		this._addSeparator();
		this._addSegmentComponents();
		this._addSeparator();

		// Create pseudoclass controller
		this.pseudoController = new PseudoclassMenuController(
			this.menu,
			this.unit,
			this.data
		);

		// Append menu
		document.body.appendChild(this.menu);

		// Position + auto-close
		this._positionMenu();
		this._enableAutoClose();
	}

	/** Collect context menu data */
	_getComponentsData( target, unit ) {
		const mainSelector = SelectorBuilder.buildSelectorSegment( target );

		const structural  = PseudoclassManager.getStructuralPseudoclasses( target );
		const isOptions   = PseudoclassManager.getValidIsOptions( target );
		const hasOptions  = PseudoclassManager.getValidHasOptions( target );
		const notOptions  = PseudoclassManager.getValidNotOptions( target, mainSelector );

		const units     = EligensInspector.chainBar.getUnits()
		const lastIndex = units.length - 1;
		const isEmpty   = unit.classList.contains( "segment-empty" );

		return {
			unit,
			target,
			mainSelector,
			structural,
			isOptions,
			hasOptions,
			notOptions,
			units,
			lastIndex,
			isEmpty
		};
	}

	/** Add option to set target element as end of chain */
	_addSetTargetOption() {
		const { unit, isEmpty, lastIndex } = this.data;
		if( isEmpty ) return;

		const index = Number( unit.dataset.index );	// get unit index in chain
		if( index === lastIndex ) return;						// do not show option for last unit

		// Create "Set as Target" option
		const opt = DomUtils.create(
			"components-menu-item set-target-option",
			null,
			"Set as Target"
		);

		// Add event listeners
		opt.addEventListener( "mouseover", () => {
			const idx      = Number( unit.dataset.index );
			const selector = EligensInspector.chainBar.buildSelectorTo(idx);
			Highlighter.highlightMatches( selector );
		} );
		opt.addEventListener( "mouseout", () => {
			Highlighter.clearHighlights();
		} );
		opt.addEventListener( "click", () => {
			EligensInspector.chainBar.setTargetAtIndex( index );
			this.menu.remove();
		} );

		this.menu.appendChild( opt );
	}

	// #region Add Segment Components
	/** Add tag and class component toggles */
	_addSegmentComponents() {
		const { unit, target } = this.data;
		const state = unit.segmentState;

		this._addTagToggle(unit, target, state);
		this._addClassToggles(unit, target, state);
	}

	/** Add tag component toggle item to menu */
	_addTagToggle( unit, target, state ) {
		const tagName = DomUtils.getTagName( target ); // get tag

		const tagItem = this._createToggleItem(
			state.tagActive,
			tagName,
			"#3b82f6",
			() => unit.manager.toggleTag(),
			unit
		);

		this.menu.appendChild( tagItem );
	}

	/** Add class component toggle items to menu */
	_addClassToggles( unit, target, state ) {
		[...target.classList].forEach( cls => {
			const active = state.classStates[cls];

			const clsItem = this._createToggleItem(
				active,
				cls,
				"#eab308",
				() => unit.manager.toggleClass( cls ),
				unit
			);

			this.menu.appendChild( clsItem );
		} );
	}

	/** Create toggle item
	 * @param {boolean}		active		- Whether toggle is active
	 * @param {string}		label			- Label of toggle
	 * @param {string}		color			- Color of toggle
	 * @param {function}	onToggle	- Function to call when toggle is clicked
	 * @returns {HTMLElement} The created toggle item
	 */
	_createToggleItem( active, label, color, onToggle ) {
		const item = DomUtils.create( "components-menu-item", null, label );

		item.style.color = color;
		if( active ) item.classList.add( "active-component" );

		item.addEventListener( "click", () => {
			onToggle();
			item.classList.toggle("active-component");

			// Update pseudoclass menu
			this.pseudoController.update();
		} );

		return item;
	}
	// #endregion Add Segment Components

	/** Add separator to menu */
	_addSeparator() {
		const separator = DomUtils.create("separator");
		this.menu.appendChild(separator);
	}

	/** Set menu position */
	_positionMenu() {
		const menuHeight			= this.menu.offsetHeight;
		this.menu.style.top		= (this.event.pageY - menuHeight) + "px";
		this.menu.style.left	= this.event.pageX + "px";
	}

	/** Set menu to close when clicked outside */
	_enableAutoClose() {
		const handler = ( event ) => {
			if( this.menu.contains( event.target ) ) return;
			this.menu.remove();
			document.removeEventListener( "click", handler );
		};
		document.addEventListener( "click", handler );
	}
}
